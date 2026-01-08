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

    def use_pk_only_optimization(self):
        return False

    def to_representation(self, value):
        # C'est ici la magie : au lieu de renvoyer l'ID, on renvoie le __str__ de l'objet
        return str(value)
class BaseSerializer(serializers.ModelSerializer):
    """
    Serializer de base.
    Tous nos serializers de modèle en hériteront.
    """
    class Meta:
        abstract = True

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