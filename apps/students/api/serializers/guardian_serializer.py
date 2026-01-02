from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import Guardian

class GuardianSerializer(BaseSerializer):
    class Meta:
        model = Guardian
        fields = "__all__"
