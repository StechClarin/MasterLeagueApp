import graphene
from django.db.models import Q
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.teaching_assignment_type import TeachingAssignmentType
from ...models import TeachingAssignment

TeachingAssignmentPaginatedType = get_paginated_type(TeachingAssignmentType)

class TeachingAssignmentQuery(graphene.ObjectType):
    teaching_assignment = graphene.Field(TeachingAssignmentType, id=graphene.ID(required=True))
    teaching_assignments = graphene.Field(
        TeachingAssignmentPaginatedType,
        search=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_teaching_assignment(root, info, id):
        try:
            return TeachingAssignment.objects.get(pk=id)
        except TeachingAssignment.DoesNotExist:
            return None

    def resolve_teaching_assignments(root, info, search=None, page=1, page_size=10, **kwargs):
        # Default ordering by academic year (desc) and classroom
        queryset = TeachingAssignment.objects.all().order_by('-academic_year__start_date', 'classroom__name')

        if search:
            queryset = queryset.filter(
                Q(teacher__first_name__icontains=search) |
                Q(teacher__last_name__icontains=search) |
                Q(subject__name__icontains=search) |
                Q(classroom__name__icontains=search)
            )

        paginated_data = paginate_queryset(queryset, page, page_size)
        return TeachingAssignmentPaginatedType(**paginated_data)
