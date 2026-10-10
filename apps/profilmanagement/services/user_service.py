from apps.core.services.BaseService import BaseService
from ..models import User, Role

class UserService(BaseService):
    model = User

    import_fields = [
        'username', 'email', 'first_name', 'last_name', 'password', 
        # On garde 'roles' comme champ texte pour l'instant, on le traite dans before_save
        'roles' 
    ]

    import_field_labels = {
        'username': "Nom d'utilisateur",
        'email': "Adresse email",
        'first_name': "Prénom",
        'last_name': "Nom de famille",
        'password': "Mot de passe",
        'roles': "Rôles (séparés par des virgules)"
    }
    
    export_fields = ['username', 'email', 'roles_display', 'is_active'] # roles_display pour l'export

    def before_validate(self, data, instance=None):
        """
        Hook avant validation.
        """
        if not instance and not data.get('password'):
            default_pass = 'DefaultPass123!'
            data['password'] = default_pass
            data['password2'] = default_pass
        return data
    
    def before_save(self, data, instance=None):
        """
        Gère l'assignation des rôles (Liste d'IDs ou Noms séparés par virgule).
        """
        # [CRITIQUE] On appelle le hook parent : injection automatique de
        # l'audit (created_by_user / updated_by_user) et de l'établissement.
        data = super().before_save(data, instance)

        # On extrait les rôles des données brutes pour les traiter
        # Attention : ManyToMany ne peut être sauvé qu'APRÈS la création de l'objet.
        # On stocke temporairement les rôles dans une variable d'instance du service
        self._roles_to_add = []

        raw_roles = data.pop('roles', None) # On retire 'roles' pour ne pas planter le create()
        
        if raw_roles:
            # Cas 1 : Import CSV (Chaîne "Admin, Manager")
            if isinstance(raw_roles, str):
                role_names = [r.strip() for r in raw_roles.split(',')]
                for name in role_names:
                    try:
                        role = Role.objects.get(name__iexact=name)
                        self._roles_to_add.append(role)
                    except Role.DoesNotExist:
                        print(f"!!!! Rôle inconnu ignoré : {name}")

            # Cas 2 : API (Liste d'IDs [1, 2])
            elif isinstance(raw_roles, list):
                # On suppose que ce sont des IDs (via PrimaryKeyRelatedField)
                self._roles_to_add = raw_roles
        
        # Si pas de rôles et création, on pourrait mettre un défaut ici
        
        return data

    def save_process(self, data, instance=None) -> tuple[User, bool]:
        # Gestion du mot de passe (inchangée)
        data.pop('password2', None)
        
        if instance:
            data.pop('password', None)
            for attr, value in data.items():
                setattr(instance, attr, value)
            instance.save()
            user = instance
            created = False
        else:
            password = data.pop('password', "DefaultPass123!")
            user = User.objects.create_user(password=password, **data)
            created = True

        return user, created

    def after_save(self, instance, created):
        """
        C'est ici qu'on sauvegarde le ManyToMany (après que l'ID User existe)
        Et qu'on synchronise la photo avec les Documents.
        """
        if hasattr(self, '_roles_to_add') and self._roles_to_add:
            # On remplace les anciens rôles ou on ajoute ? 
            # Ici on set() pour remplacer (plus propre pour un save complet)
            instance.roles.set(self._roles_to_add)

        # Synchronisation Photo -> Document
        if instance.photo:
            from django.contrib.contenttypes.models import ContentType
            from apps.documents.models.document import Document
            
            ct = ContentType.objects.get_for_model(instance)
            
            doc = Document.objects.filter(
                content_type=ct, 
                object_id=instance.id, 
                document_type='PHOTO'
            ).first()

            if not doc:
                # On crée l'objet Document manuellement pour éviter que Django ne duplique le fichier
                # en utilisant doc.file = instance.photo (qui déclencherait le storage backend).
                doc = Document(
                    content_type=ct,
                    object_id=instance.id,
                    document_type='PHOTO',
                    title=f"Photo de profil - {instance.username}"
                )
                # On force le chemin du fichier vers celui de l'avatar existant
                doc.file.name = instance.photo.name
                doc.save()
            else:
                # Mise à jour si le fichier diffère
                if doc.file.name != instance.photo.name:
                    doc.file.name = instance.photo.name
                    doc.title = f"Photo de profil - {instance.username}"
                    doc.save()