import graphene
from ..Types.level_type import LevelType
from apps.structure.models.level import Level
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from apps.core.graphql.utils.queryset_filter import get_context_filtered_queryset

class LevelQuery(graphene.ObjectType):
    level = graphene.Field(LevelType, id=graphene.ID(required=True))
    levels = graphene.Field(
        get_paginated_type(LevelType),
        search=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_level(root, info, id):
        try:
            return Level.objects.get(pk=id)
        except Level.DoesNotExist:
            return None

    def resolve_levels(root, info, search=None, page=1, page_size=10, **kwargs):
        queryset = get_context_filtered_queryset(Level, info, order_by='order')
        
        if search:
            queryset = queryset.filter(name__icontains=search)
            
        return paginate_queryset(queryset, page, page_size)
