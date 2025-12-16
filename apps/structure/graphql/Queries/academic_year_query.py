import graphene
from ..Types.academic_year_type import AcademicYearType
from apps.structure.models.academic_year import AcademicYear
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from apps.core.graphql.utils.queryset_filter import get_context_filtered_queryset

class AcademicYearQuery(graphene.ObjectType):
    academicyear = graphene.Field(AcademicYearType, id=graphene.ID(required=True))
    academicyears = graphene.Field(
        get_paginated_type(AcademicYearType),
        search=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_academicyear(root, info, id):
        try:
            return AcademicYear.objects.get(pk=id)
        except AcademicYear.DoesNotExist:
            return None

    def resolve_academicyears(root, info, search=None, page=1, page_size=10, **kwargs):
        queryset = get_context_filtered_queryset(AcademicYear, info, order_by='-start_date')
        
        if search:
            queryset = queryset.filter(name__icontains=search)
            
        return paginate_queryset(queryset, page, page_size)
