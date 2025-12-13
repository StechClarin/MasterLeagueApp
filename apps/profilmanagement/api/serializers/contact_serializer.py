from rest_framework import serializers
from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import Contact

class ContactSerializer(BaseSerializer):
    personne = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Contact
        fields = '__all__'
