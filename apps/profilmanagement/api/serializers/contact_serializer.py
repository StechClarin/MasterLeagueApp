from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import Contact

class ContactSerializer(BaseSerializer):
    class Meta:
        model = Contact
        fields = '__all__'
