import graphene
from django.db.models import Q
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.planning_detail_type import PlanningDetailType
from ...models.planningdetail import PlanningDetail

PlanningDetailPaginatedType = get_paginated_type(PlanningDetailType)

class PlanningDetailQuery(graphene.ObjectType):
    planning_detail = graphene.Field(PlanningDetailType, id=graphene.ID(required=True))
    planning_details = graphene.Field(
        PlanningDetailPaginatedType,
        search=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_planning_detail(root, info, id):
        try:
            return PlanningDetail.objects.get(pk=id)
        except PlanningDetail.DoesNotExist:
            return None

    def resolve_planning_details(root, info, search=None, page=1, page_size=10, **kwargs):
        queryset = PlanningDetail.objects.filter(is_active=True).order_by('-date')

        if search:
            queryset = queryset.filter(
                Q(enseignant__first_name__icontains=search) | 
                Q(matiere__name__icontains=search)
            )

        paginated_data = paginate_queryset(queryset, page, page_size)
        return PlanningDetailPaginatedType(**paginated_data)
