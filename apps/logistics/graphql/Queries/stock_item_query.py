import graphene
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.stock_item_type import StockItemType
from ...models.stock_item import StockItem

StockItemPaginatedType = get_paginated_type(StockItemType)

class StockItemQuery(graphene.ObjectType):
    stock_item = graphene.Field(StockItemType, id=graphene.ID(required=True))
    stock_items = graphene.Field(
        StockItemPaginatedType,
        search=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_stock_item(root, info, id):
        try:
            queryset = StockItem.objects.filter(pk=id)
            if hasattr(info.context, 'establishment_id') and info.context.establishment_id:
                queryset = queryset.filter(establishment_id=info.context.establishment_id)
            return queryset.get()
        except StockItem.DoesNotExist:
            return None

    def resolve_stock_items(root, info, search=None, page=1, page_size=10, **kwargs):
        from apps.core.graphql.utils.queryset_filter import get_context_filtered_queryset
        queryset = get_context_filtered_queryset(StockItem, info, order_by='-created_at')

        if search:
            queryset = queryset.filter(name__icontains=search)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return StockItemPaginatedType(**paginated_data)
