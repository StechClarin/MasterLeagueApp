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
        classe_id=graphene.ID(),
        min_date=graphene.Date(),
        max_date=graphene.Date(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_planning_detail(root, info, id):
        try:
            queryset = PlanningDetail.objects.filter(pk=id)
            if hasattr(info.context, 'establishment_id') and info.context.establishment_id:
                queryset = queryset.filter(establishment_id=info.context.establishment_id)
            return queryset.get()
        except PlanningDetail.DoesNotExist:
            return None

    def resolve_planning_details(root, info, search=None, classe_id=None, min_date=None, max_date=None, page=1, page_size=10, **kwargs):
        from apps.core.graphql.utils.queryset_filter import get_context_filtered_queryset
        queryset = get_context_filtered_queryset(PlanningDetail, info, order_by='date')
        queryset = queryset.filter(is_active=True).order_by('date', 'heure_debut')

        if search:
            queryset = queryset.filter(
                Q(enseignant__user__first_name__icontains=search) | 
                Q(enseignant__user__last_name__icontains=search) |
                Q(matiere__name__icontains=search)
            )

        if classe_id:
            queryset = queryset.filter(classe_id=classe_id)

        if min_date:
            queryset = queryset.filter(date__gte=min_date)

        if max_date:
            queryset = queryset.filter(date__lte=max_date)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return PlanningDetailPaginatedType(**paginated_data)
