import graphene
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.planning_type import PlanningType
from ...models import Planning

PlanningPaginatedType = get_paginated_type(PlanningType)

class PlanningQuery(graphene.ObjectType):
    planning = graphene.Field(PlanningType, id=graphene.ID(required=True))
    plannings = graphene.Field(
        PlanningPaginatedType,
        search=graphene.String(),
        min_date=graphene.Date(),
        max_date=graphene.Date(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_planning(root, info, id):
        try:
            return Planning.objects.get(pk=id)
        except Planning.DoesNotExist:
            return None

    def resolve_plannings(root, info, search=None, min_date=None, max_date=None, page=1, page_size=10, **kwargs):
        queryset = Planning.objects.all().order_by('-created_at')

        if search:
            queryset = queryset.filter(name__icontains=search)
        
        if min_date:
            queryset = queryset.filter(date_end__gte=min_date)
            
        if max_date:
            queryset = queryset.filter(date_start__lte=max_date)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return PlanningPaginatedType(**paginated_data)
