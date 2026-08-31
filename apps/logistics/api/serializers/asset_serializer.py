from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models.asset import Asset

class AssetSerializer(BaseSerializer):
    class Meta:
        model = Asset
        fields = "__all__"
