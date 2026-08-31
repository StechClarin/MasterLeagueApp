import graphene
from graphene_django.types import DjangoObjectType
from ...models.stock_item import StockItem

class StockItemType(DjangoObjectType):
    class Meta:
        model = StockItem
        fields = "__all__"
