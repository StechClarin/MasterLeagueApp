from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models.stock_item import StockItem

class StockItemSerializer(BaseSerializer):
    class Meta:
        model = StockItem
        fields = "__all__"
