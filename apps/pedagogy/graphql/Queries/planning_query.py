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
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_planning(root, info, id):
        try:
            return Planning.objects.get(pk=id)
        except Planning.DoesNotExist:
            return None

    def resolve_plannings(root, info, search=None, page=1, page_size=10, **kwargs):
        queryset = Planning.objects.all().order_by('-created_at')

        if search:
            queryset = queryset.filter(name__icontains=search)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return PlanningPaginatedType(**paginated_data)
