from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models.cycle import Cycle

class CycleSerializer(BaseSerializer):
    class Meta:
        model = Cycle
        fields = "__all__"
