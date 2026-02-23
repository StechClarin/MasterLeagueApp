import graphene
from django.db.models import Q
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.grade_type import GradeType
from ...models import Grade

GradePaginatedType = get_paginated_type(GradeType)

class GradeQuery(graphene.ObjectType):
    grades = graphene.Field(
        GradePaginatedType,
        evaluation_id=graphene.Int(),
        student_id=graphene.Int(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_grades(root, info, evaluation_id=None, student_id=None, page=1, page_size=10, **kwargs):
        # Multi-tenancy Isolation
        est_id = getattr(info.context, 'establishment_id', None)
        queryset = Grade.objects.filter(establishment_id=est_id).order_by('evaluation', 'student')
        
        if evaluation_id:
            queryset = queryset.filter(evaluation_id=evaluation_id)
            
        if student_id:
            queryset = queryset.filter(student_id=student_id)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return GradePaginatedType(**paginated_data)
