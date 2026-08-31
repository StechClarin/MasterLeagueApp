import graphene
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.asset_type import AssetType
from ...models.asset import Asset

AssetPaginatedType = get_paginated_type(AssetType)

class AssetQuery(graphene.ObjectType):
    asset = graphene.Field(AssetType, id=graphene.ID(required=True))
    assets = graphene.Field(
        AssetPaginatedType,
        search=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_asset(root, info, id):
        try:
            queryset = Asset.objects.filter(pk=id)
            if hasattr(info.context, 'establishment_id') and info.context.establishment_id:
                queryset = queryset.filter(establishment_id=info.context.establishment_id)
            return queryset.get()
        except Asset.DoesNotExist:
            return None

    def resolve_assets(root, info, search=None, page=1, page_size=10, **kwargs):
        from apps.core.graphql.utils.queryset_filter import get_context_filtered_queryset
        queryset = get_context_filtered_queryset(Asset, info, order_by='-created_at')

        if search:
            queryset = queryset.filter(name__icontains=search)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return AssetPaginatedType(**paginated_data)
