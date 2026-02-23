import graphene
from django.db.models import Q
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.academic_period_type import AcademicPeriodType
from ...models import AcademicPeriod

AcademicPeriodPaginatedType = get_paginated_type(AcademicPeriodType)

class AcademicPeriodQuery(graphene.ObjectType):
    academic_periods = graphene.Field(
        AcademicPeriodPaginatedType,
        search=graphene.String(),
        academic_year_id=graphene.Int(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_academic_periods(root, info, search=None, academic_year_id=None, page=1, page_size=10, **kwargs):
        # Multi-tenancy Isolation
        est_id = getattr(info.context, 'establishment_id', None)
        queryset = AcademicPeriod.objects.filter(establishment_id=est_id).order_by('-academic_year', 'start_date')
        
        if search:
            queryset = queryset.filter(Q(name__icontains=search))
            
        if academic_year_id:
            queryset = queryset.filter(academic_year_id=academic_year_id)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return AcademicPeriodPaginatedType(**paginated_data)
