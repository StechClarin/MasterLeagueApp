import graphene
from ..Types.cycle_type import CycleType
from apps.structure.models.cycle import Cycle
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from apps.core.graphql.utils.queryset_filter import get_context_filtered_queryset

class CycleQuery(graphene.ObjectType):
    cycle = graphene.Field(CycleType, id=graphene.ID(required=True))
    cycles = graphene.Field(
        get_paginated_type(CycleType),
        search=graphene.String(),
        establishment_id=graphene.ID(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_cycle(root, info, id):
        try:
            return Cycle.objects.get(pk=id)
        except Cycle.DoesNotExist:
            return None

    def resolve_cycles(root, info, search=None, establishment_id=None, page=1, page_size=10, **kwargs):
        queryset = get_context_filtered_queryset(Cycle, info, order_by='order')
        
        if search:
            queryset = queryset.filter(name__icontains=search)
            
        if establishment_id:
            queryset = queryset.filter(establishment_id=establishment_id)
            
        return paginate_queryset(queryset, page, page_size)
