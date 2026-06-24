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

    compiled_schedule = graphene.List(
        graphene.JSONString,
        start_date=graphene.Date(required=True),
        end_date=graphene.Date(required=True),
        classroom_id=graphene.ID(),
        personnel_id=graphene.ID()
    )

    def resolve_planning(root, info, id):
        try:
            queryset = Planning.objects.filter(pk=id)
            if hasattr(info.context, 'establishment_id') and info.context.establishment_id:
                queryset = queryset.filter(establishment_id=info.context.establishment_id)
            return queryset.get()
        except Planning.DoesNotExist:
            return None

    def resolve_plannings(root, info, search=None, min_date=None, max_date=None, page=1, page_size=10, **kwargs):
        from apps.core.graphql.utils.queryset_filter import get_context_filtered_queryset
        queryset = get_context_filtered_queryset(Planning, info, order_by='-created_at')

        if search:
            queryset = queryset.filter(nom__icontains=search)
        
        if min_date:
            queryset = queryset.filter(date_end__gte=min_date)
            
        if max_date:
            queryset = queryset.filter(date_start__lte=max_date)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return PlanningPaginatedType(**paginated_data)

    def resolve_compiled_schedule(root, info, start_date, end_date, classroom_id=None, personnel_id=None):
        from apps.pedagogy.services.planning_engine_service import PlanningEngineService
        
        establishment_id = getattr(info.context, 'establishment_id', None)
        if not establishment_id:
            raise Exception("Un établissement actif est requis.")
            
        compiled = PlanningEngineService.get_compiled_schedule(
            establishment_id=establishment_id,
            start_date=start_date,
            end_date=end_date,
            classroom_id=classroom_id,
            personnel_id=personnel_id
        )
        return compiled
