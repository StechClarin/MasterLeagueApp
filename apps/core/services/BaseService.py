from typing import Any, cast
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.http import Http404
from django.db.transaction import atomic as db_atomic
from apps.core.utils.importfile import ImportFile
from apps.core.utils.exportfile import ExportFile

class BaseService:
    """
    Service de base (Cœur Logique).
    
    Responsabilités :
    1. CRUD standard (List, Get, Save, Delete).
    2. Orchestration de sauvegarde (Hooks before/after).
    3. Import/Export générique et intelligent.
    
    Les services enfants (ex: ProductService) doivent hériter de cette classe.
    """
    
    # Le modèle Django ciblé (à définir dans l'enfant, ex: model = Product)
    model: Any = cast(Any, None) 
    
    # [CRITICAL UPDATE] Expose raw payload to service for nested custom saves (after_save logic)
    initial_data: Any = None
    # Configuration de l'Export : liste des champs (ex: ['name', 'price'])
    export_fields = [] 
    
    # Configuration de l'Import : liste des champs ou config relations
    # ex: ['name', {'category': {'model': Category, 'search_field': 'name'}}]
    import_fields = []
    import_field_labels = {}

    def __init__(self):
        self.user = None
        self.establishment_id = None

    # ==========================================================================
    # 1. MÉTHODES DE LECTURE (Read)
    # ==========================================================================

    def set_context(self, user, establishment_id=None):
        """
        Injecte le contexte de la requête (User, Etablissement).
        Appelé par le Contrôleur avant chaque action.
        """
        self.user = user
        self.establishment_id = establishment_id

    def list(self, filters=None):
        """
        Récupère une liste d'objets, avec filtrage optionnel et contextuel.
        """
        if self.model is None:
            raise ValueError(f"Le service {self.__class__.__name__} doit définir un attribut 'model'.")
        queryset = self.model.objects.all()

        # Filtrage contextuel (Establishment)
        est_id = getattr(self, 'establishment_id', None)
        if est_id:
            # Cas 1 : Le modèle appartient à un établissement (ex: Classroom, Subject)
            if hasattr(self.model, 'establishment'):
                queryset = queryset.filter(establishment_id=est_id)
            # Cas 2 : Le modèle EST l'établissement (on ne voit que soi-même)
            elif self.model.__name__ == 'Establishment':
                queryset = queryset.filter(id=est_id)

        if filters:
            return queryset.filter(**filters)
        return queryset

    def get_by_id(self, pk):
        """
        Récupère un objet par son ID. Lève une 404 si non trouvé.
        """
        if self.model is None:
             raise ValueError(f"Le service {self.__class__.__name__} doit définir un attribut 'model'.")
             
        try:
            return self.model.objects.get(pk=pk)
        except (ObjectDoesNotExist, ValueError, TypeError):
            raise Http404(f"{self.model.__name__} non trouvé")

    # ==========================================================================
    # 2. MÉTHODES D'ÉCRITURE (CUD - Save Flow)
    # ==========================================================================

    def before_validate(self, data, instance=None):
        """
        [HOOK] Exécuté AVANT le Serializer.
        Sert à nettoyer les données brutes (trim, upper case, formatage).
        Doit retourner le dictionnaire 'data' modifié.
        """
        if self.model is None:
             raise ValueError(f"Le service {self.__class__.__name__} doit définir un attribut 'model'.")
             
        # Injection automatique de l'établissement si le modèle est lié
        if hasattr(self.model, 'establishment') and hasattr(self, 'establishment_id') and self.establishment_id:
             print(f"DEBUG: Injecting establishment_id {self.establishment_id} into data")
             # On ne l'ajoute que s'il n'est pas déjà présent (permet de forcer si besoin)
             if 'establishment' not in data and 'establishment_id' not in data:
                 data['establishment_id'] = self.establishment_id
        else:
            print(f"DEBUG: Skip injection. Model:{hasattr(self.model, 'establishment')}, ID:{getattr(self, 'establishment_id', 'Not Set')}")
        
        return data

    def save(self, validated_data, instance=None):
        """
        Chef d'orchestre de la sauvegarde.
        Ne pas surcharger cette méthode ! Surchargez les hooks ci-dessous.
        Gère la séquence : Before -> Process (Create/Update) -> After.
        """
        # 1. Hook Avant (Dernière modif des données validées avant écriture)
        validated_data = self.before_save(validated_data, instance)

        # 2. Écriture en base (gère automatiquement Create ou Update)
        obj, created = self.save_process(validated_data, instance)

        # 3. Hook Après (Notifications, Logs, actions asynchrones)
        self.after_save(obj, created)

        return obj

    # --- Les Hooks surchargeables ---

    def before_save(self, data, instance=None):
        # Gérer le cas où establishment est fourni sous forme de string/UUID (ex: via DRF default)
        if 'establishment' in data and not hasattr(data['establishment'], '_meta'):
            data['establishment_id'] = data.pop('establishment')

        # [SAFETY NET] Injection de l'établissement si manquant
        if hasattr(self.model, 'establishment') and hasattr(self, 'establishment_id') and self.establishment_id:
            should_inject = False
            if not instance:
                should_inject = True # Création
            elif not instance.establishment_id:
                should_inject = True # Instance orpheline (rare)
            
            if should_inject:
                if 'establishment' not in data and 'establishment_id' not in data:
                     data['establishment_id'] = self.establishment_id

        # [AUDIT] Injection automatique de l'utilisateur (Pattern Global)
        if hasattr(self, 'user') and self.user:
            # updated_by_user : Toujours mis à jour
            if hasattr(self.model, 'updated_by_user'):
                data['updated_by_user_id'] = self.user.id
            
            # created_by_user : Uniquement à la création
            if not instance and hasattr(self.model, 'created_by_user'):
                data['created_by_user_id'] = self.user.id

        return data

    def save_process(self, data, instance=None) -> tuple[Any, bool]:
        """
        Effectue l'écriture réelle en base de données.
        Gère automatiquement les champs ManyToMany (M2M) qui ne peuvent pas être assignés directement.
        """
        m2m_data = {}
        simple_data = {}
        
        # Identification des champs M2M du modèle
        if self.model is None:
             raise ValueError(f"Le service {self.__class__.__name__} doit définir un attribut 'model'.")
             
        model_m2m_fields = [
            f.name for f in self.model._meta.get_fields() 
            if f.many_to_many and not f.auto_created
        ]
        
        for key, value in data.items():
            if key in model_m2m_fields:
                m2m_data[key] = value
            else:
                simple_data[key] = value

        if instance:
            # Mode Update
            for attr, value in simple_data.items():
                setattr(instance, attr, value)
            instance.save()
            
            # Mise à jour des M2M (après save)
            for attr, value in m2m_data.items():
                getattr(instance, attr).set(value)
                
            return instance, False
        else:
            # Mode Create
            # 1. Création avec les champs simples uniquement
            obj = self.model.objects.create(**simple_data)
            
            # 2. Assignation des M2M
            for attr, value in m2m_data.items():
                getattr(obj, attr).set(value)
                
            return obj, True

    def after_save(self, instance, created):
        """
        [HOOK] À surcharger pour les actions post-sauvegarde.
        Ex: Envoyer un email de bienvenue, mettre à jour un cache, Websockets.
        """
        pass

    def delete(self, instance):
        """
        Supprime un objet.
        Retourne un petit rapport.
        """
        instance_id = instance.id
        instance.delete()
        return {"id": instance_id, "status": "deleted"}

    # ==========================================================================
    # 3. IMPORT / EXPORT (Outils de masse)
    # ==========================================================================

    # ... (imports et début de classe inchangés)

    def get_queryset_for_export(self):
        """
        [HOOK] Retourne le queryset utilisé pour l'export.
        À surcharger pour optimiser avec select_related() ou prefetch_related().
        Par défaut : self.model.objects.all()
        """
        if self.model is None:
             raise ValueError(f"Le service {self.__class__.__name__} doit définir un attribut 'model'.")
        return self.model.objects.all()

    def export_data(self, format_type='csv'):
        """
        Génère un fichier (CSV/Excel) contenant les données.
        Gère le renommage des colonnes (Aliasing) pour les relations.
        """
        if self.model is None:
             raise ValueError(f"Le service {self.__class__.__name__} doit définir un attribut 'model'.")
        # 1. Préparation des champs à demander à la BDD
        fields_to_query = [] # Ce qu'on envoie au .values() de Django
        header_mapping = {}  # Pour renommer les colonnes à la fin (ex: role__name -> role)

        if self.export_fields:
            for field in self.export_fields:
                if isinstance(field, dict):
                    # Cas complexe : {'role__name': 'role'}
                    db_field = list(field.keys())[0]
                    csv_header = field[db_field]
                    
                    fields_to_query.append(db_field)
                    header_mapping[db_field] = csv_header
                else:
                    # Cas simple : 'username'
                    fields_to_query.append(field)
                    header_mapping[field] = field # Pas de changement de nom
        else:
            # Fallback : tous les champs simples
            fields_to_query = [f.name for f in self.model._meta.fields]
            header_mapping = {f: f for f in fields_to_query}

        # 2. Requête optimisée
        # On utilise le hook pour permettre les optimisations (select_related)
        queryset = self.get_queryset_for_export().values(*fields_to_query)
        
        # 3. Renommage des clés (Mapping)
        # On transforme [{'username': 'toto', 'role__name': 'Admin'}]
        # en          [{'username': 'toto', 'role': 'Admin'}]
        data_list = []
        for row in queryset:
            new_row = {}
            for db_key, value in row.items():
                # On utilise le nom mappé pour le CSV
                new_key = header_mapping.get(db_key, db_key)
                new_row[new_key] = value
            data_list.append(new_row)

        # 4. Génération du fichier
        filename = self.model._meta.verbose_name_plural.lower().replace(' ', '_')
        
        if format_type == 'excel': 
            return ExportFile.to_excel(data_list, filename)
        return ExportFile.to_csv(data_list, filename)

    def relation_in_import(self, field_name, value, config, cache=None):
        """
        Helper pour résoudre une clé étrangère lors de l'import.
        Ex: Transforme "Manager" en l'objet Role(id=5).
        Utilise un cache local pour éviter les requêtes répétitives (N+1).
        """
        if not value:
            return None
            
        value_str = str(value).strip()
        value_key = value_str.lower() # Clé de cache normalisée (insensible à la casse)

        # 1. Vérification du cache
        if cache is not None:
            if field_name not in cache:
                cache[field_name] = {}
            
            if value_key in cache[field_name]:
                return cache[field_name][value_key]

        related_model = config.get('model')
        search_field = config.get('search_field', 'name')
        
        try:
            # Recherche insensible à la casse (iexact)
            query = {f"{search_field}__iexact": value_str}
            obj = related_model.objects.get(**query)

            # 2. Mise en cache
            if cache is not None:
                cache[field_name][value_key] = obj
            
            return obj

        except related_model.DoesNotExist:
            raise ValueError(f"Le {field_name} '{value}' n'existe pas.")
        except Exception as e:
            raise ValueError(f"Erreur sur {field_name}: {str(e)}")

    def import_data(self, file_obj, atomic=False):
        """
        Importe des données depuis un fichier.
        Gère la conversion, la résolution des relations et la création via save().
        """
        raw_data = ImportFile.parse(file_obj)
        created_count = 0
        errors = []
        
        # Analyse de la configuration (Champs simples vs Relations)
        simple_fields = set()
        relation_configs = {}

        if self.import_fields:
            for field in self.import_fields:
                if isinstance(field, dict):
                    # C'est une relation : {'role': {'model': Role...}}
                    key = list(field.keys())[0]
                    relation_configs[key] = field[key]
                else:
                    simple_fields.add(field)
        
        # Cache local pour toute la durée de l'import
        relation_cache = {}

        # Reverse mapping if import_field_labels is present
        reverse_labels = {}
        if hasattr(self, 'import_field_labels') and self.import_field_labels:
            for k, v in self.import_field_labels.items():
                reverse_labels[str(v).strip().lower()] = k

        try:
            with db_atomic():
                for index, row in enumerate(raw_data):
                    row_num = index + 2 # +1 header, +1 index 0
                    try:
                        data_to_save = {}
                        
                        # Translate headers from labels to field names if defined
                        translated_row = {}
                        for key, value in row.items():
                            clean_key = str(key).strip().lower()
                            mapped_key = reverse_labels.get(clean_key, key)
                            translated_row[mapped_key] = value

                        for key, value in translated_row.items():
                            # Cas 1 : Champ simple autorisé
                            if not self.import_fields or key in simple_fields:
                                data_to_save[key] = value
                            
                            # Cas 2 : Relation configurée (Résolution auto avec Cache)
                            elif key in relation_configs:
                                config = relation_configs[key]
                                data_to_save[key] = self.relation_in_import(key, value, config, relation_cache)

                        # Exécuter les hooks de pré-validation (génère le matricule, etc.)
                        if hasattr(self, 'before_validate'):
                            data_to_save = self.before_validate(data_to_save)

                        # Appel au flux de sauvegarde complet (Hooks inclus !)
                        self.save(data_to_save, instance=None)
                        created_count += 1
                        
                    except Exception as e:
                        errors.append(f"Ligne {row_num}: {str(e)}")
                        # Si mode atomique strict, on arrête tout à la première erreur
                        if atomic: raise ValueError(str(e))
                        
        except ValueError as e:
             return {"status": "error", "imported": 0, "errors": [str(e)]}

        return {
            "status": "success" if not errors else "partial_success", 
            "imported": created_count, 
            "errors": errors
        }

    # ==========================================================================
    # 4. GESTION DES STATUTS (Activate/Deactivate)
    # ==========================================================================

    def status(self, pk):
        """
        Change le statut (is_active) d'un objet.
        Gère le hook before_status.
        """
        instance = self.get_by_id(pk)
        
        # Hook avant changement (Validation ou Logique métier)
        self.before_status(instance)
        
        # Bascule du statut (si le champ existe)
        if hasattr(instance, 'is_active'):
            instance.is_active = not instance.is_active
            instance.save()
            
            # [CRITICAL] On déclenche le hook after_save pour synchroniser les impacts (ex: Membership)
            if hasattr(self, 'after_save'):
                self.after_save(instance, False) 
        else:
            raise ValidationError(f"Le modèle {self.model.__name__} n'a pas de champ 'is_active'.")
            
        return instance

    def before_status(self, instance):
        """
        [HOOK] À surcharger pour vérifier des règles avant changement de statut.
        Ex: Impossible de désactiver un admin principal.
        """
        pass

    # ==========================================================================
    # 5. GÉNÉRATION DE TRAME (Template)
    # ==========================================================================

    def generate_template(self):
        """
        Génère un fichier Excel vide contenant uniquement les en-têtes
        basés sur la configuration 'import_fields'.
        """
        # 1. Extraction des en-têtes depuis import_fields
        headers = []
        labels_map = getattr(self, 'import_field_labels', {}) or {}
        if self.import_fields:
            for field in self.import_fields:
                if isinstance(field, dict):
                    # Cas complexe : {'role': {'model': Role...}} -> 'role'
                    key = list(field.keys())[0]
                    headers.append(labels_map.get(key, key))
                else:
                    # Cas simple : 'username'
                    headers.append(labels_map.get(field, field))
        else:
            # Fallback : tous les champs du modèle (moins risqué de ne rien mettre ?)
            # On met au moins les champs obligatoires si possible, ou tous.
            for f in self.model._meta.fields:
                headers.append(labels_map.get(f.name, f.name))

        # 2. Création de la structure pour l'export (une seule ligne vide ou juste headers)
        # ExportFile.to_excel attend une liste de dicts.
        # On peut passer une liste vide [], mais il faut que to_excel sache gérer les headers seuls.
        # Ou on passe une ligne avec des valeurs vides.
        empty_row = {header: "" for header in headers}
        
        # 3. Génération
        filename = f"trame_import_{self.model._meta.verbose_name_plural.lower().replace(' ', '_')}"
        return ExportFile.to_excel([empty_row], filename)