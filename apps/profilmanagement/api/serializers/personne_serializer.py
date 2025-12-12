from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import Personne
from .contact_serializer import ContactSerializer

class PersonneSerializer(BaseSerializer):
    # Nested Write: On permet de créer/modifier les contacts directement avec la personne
    contacts = ContactSerializer(many=True, required=False)

    class Meta:
        model = Personne
        fields = '__all__'
