from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import Establishment

class EstablishmentSerializer(BaseSerializer):
    class Meta:
        model = Establishment
        fields = "__all__"
