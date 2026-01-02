import graphene
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.teaching_assignment_type import TeachingAssignmentType
from ...models.teaching_assignment import TeachingAssignment
from django.db.models import Q

TeachingAssignmentPaginatedType = get_paginated_type(TeachingAssignmentType)

class TeachingAssignmentQuery(graphene.ObjectType):
    teaching_assignment = graphene.Field(TeachingAssignmentType, id=graphene.ID(required=True))
    teaching_assignments = graphene.Field(
        TeachingAssignmentPaginatedType,
        search=graphene.String(), # Search by teacher name or classroom
        teacher_id=graphene.Int(),
        classroom_id=graphene.Int(),
        academic_year_id=graphene.Int(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_teaching_assignment(root, info, id):
        try:
            return TeachingAssignment.objects.get(pk=id)
        except TeachingAssignment.DoesNotExist:
            return None

    def resolve_teaching_assignments(root, info, search=None, teacher_id=None, classroom_id=None, academic_year_id=None, page=1, page_size=10, **kwargs):
        queryset = TeachingAssignment.objects.select_related('teacher', 'teacher__user', 'classroom', 'subject', 'academic_year').order_by('-created_at')

        if teacher_id:
            queryset = queryset.filter(teacher_id=teacher_id)
        if classroom_id:
            queryset = queryset.filter(classroom_id=classroom_id)
        if academic_year_id:
            queryset = queryset.filter(academic_year_id=academic_year_id)

        if search:
            queryset = queryset.filter(
                Q(teacher__user__last_name__icontains=search) |
                Q(teacher__user__first_name__icontains=search) |
                Q(subject__name__icontains=search) |
                Q(classroom__name__icontains=search)
            )

        paginated_data = paginate_queryset(queryset, page, page_size)
        return TeachingAssignmentPaginatedType(**paginated_data)
