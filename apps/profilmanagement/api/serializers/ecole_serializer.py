from apps.core.api.serializers import BaseSerializer
from ...models import Ecole

class EcoleSerializer(BaseSerializer):
    class Meta:
        model = Ecole
        fields = '__all__'
