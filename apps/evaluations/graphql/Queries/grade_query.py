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
        evaluation_subject_id=graphene.ID(),
        evaluation_session_id=graphene.ID(),
        student_id=graphene.ID(),
        academic_period_id=graphene.ID(),
        classroom_id=graphene.ID(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_grades(root, info, evaluation_subject_id=None, evaluation_session_id=None, student_id=None, academic_period_id=None, classroom_id=None, page=1, page_size=10, **kwargs):
        # Multi-tenancy Isolation
        est_id = getattr(info.context, 'establishment_id', None)
        queryset = Grade.objects.filter(establishment_id=est_id).order_by('evaluation_subject', 'student')
        
        if evaluation_subject_id:
            queryset = queryset.filter(evaluation_subject_id=evaluation_subject_id)
            
        if evaluation_session_id:
            queryset = queryset.filter(evaluation_subject__session=evaluation_session_id)
            
        if student_id:
            queryset = queryset.filter(student_id=student_id)

        if academic_period_id:
            queryset = queryset.filter(evaluation_subject__session__academic_period_id=academic_period_id)

        if classroom_id:
            # We filter by student's active enrollment for this classroom
            queryset = queryset.filter(student__enrollments__classroom_id=classroom_id)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return GradePaginatedType(**paginated_data)
