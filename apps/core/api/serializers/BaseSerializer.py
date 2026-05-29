# apps/core/api/serializers/BaseSerializer.py
from rest_framework import serializers

class SmartRelatedField(serializers.PrimaryKeyRelatedField):
    """
    Un champ hybride magique pour les relations (ForeignKey / ManyToMany).
    - ENTRÉE (Write) : Accepte des IDs (ex: [1, 2]).
    - SORTIE (Read)  : Renvoie la représentation string (ex: ["Admin", "Manager"]).
    """
    def __init__(self, **kwargs):
        # Par défaut, on veut lire l'ID en entrée
        super().__init__(**kwargs)

    def use_pk_only_optimization(self):  # type: ignore
        return False

    def to_representation(self, value):
        # C'est ici la magie : au lieu de renvoyer l'ID, on renvoie le __str__ de l'objet
        return str(value)
class CurrentEstablishmentDefault:
    requires_context = True

    def __call__(self, serializer_field):
        request = serializer_field.context.get('request')
        if request and hasattr(request, 'establishment_id') and request.establishment_id:
            return request.establishment_id
        return None

class BaseSerializer(serializers.ModelSerializer):
    """
    Serializer de base.
    Tous nos serializers de modèle en hériteront.
    """
    class Meta:
        abstract = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Injection automatique : 'establishment' est géré par le backend
        fields = getattr(self, 'fields')
        if 'establishment' in fields:
            fields['establishment'].required = False
            fields['establishment'].allow_null = True
            fields['establishment'].default = CurrentEstablishmentDefault()

    def create(self, validated_data):
        """
        Surcharge de create pour injecter automatiquement l'établissement
        si le modèle est 'EstablishmentAware' et que l'ID est dans la request.
        """
        model_class = getattr(self.Meta, 'model', None)
        request = self.context.get('request')

        # Gérer le cas où CurrentEstablishmentDefault a injecté l'ID sous forme de string/UUID
        if 'establishment' in validated_data and not hasattr(validated_data['establishment'], '_meta'):
            validated_data['establishment_id'] = validated_data.pop('establishment')

        # Si le modèle a un champ 'establishment' et qu'il n'est pas déjà fourni
        if hasattr(model_class, 'establishment') and 'establishment' not in validated_data and 'establishment_id' not in validated_data:
            if request and hasattr(request, 'establishment_id') and request.establishment_id:
                validated_data['establishment_id'] = request.establishment_id
            else:
                # Si l'ID n'est pas dans la request (Header manquant) et pas dans le body
                # On lève une erreur explicite au lieu de laisser l'IntegrityError
                raise serializers.ValidationError({
                    "establishment": [
                        "Impossible de déterminer l'établissement de contexte. "
                        "Veuillez sélectionner un établissement actif ou en fournir un."
                    ]
                })

        return super().create(validated_data)

    def create_nested(self, parent_instance, relation_name, data_list, parent_field_name=None):
        """
        Helper pour créer des objets enfants liés.
        Args:
            parent_instance: L'objet parent créé.
            relation_name: Nom du champ relation (ex: 'contacts').
            data_list: Liste de données pour les enfants.
            parent_field_name: Nom du champ FK dans l'enfant vers le parent. 
                               Si None, tente de deviner (nom du modèle parent en minuscules).
        """
        if not data_list: return

        related_manager = getattr(parent_instance, relation_name)
        model = related_manager.model
        
        # Deviner le champ FK
        if not parent_field_name:
            parent_field_name = parent_instance._meta.model_name
            
        created_objects = []
        for item_data in data_list:
            # Injection de la FK
            item_data[parent_field_name] = parent_instance
            created_objects.append(model(**item_data))
            
        model.objects.bulk_create(created_objects)