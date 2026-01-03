from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import ContractType

class ContractTypeSerializer(BaseSerializer):
    class Meta:
        model = ContractType
        fields = "__all__"
