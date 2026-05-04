import graphene
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.studentattendance_type import StudentAttendanceType
from ...models import StudentAttendance

StudentAttendancePaginatedType = get_paginated_type(StudentAttendanceType)

class StudentAttendanceQuery(graphene.ObjectType):
    studentattendance = graphene.Field(StudentAttendanceType, id=graphene.ID(required=True))
    studentattendances = graphene.Field(
        StudentAttendancePaginatedType,
        search=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_studentattendance(root, info, id):
        try:
            return StudentAttendance.objects.get(pk=id)
        except StudentAttendance.DoesNotExist:
            return None

    def resolve_studentattendances(root, info, search=None, page=1, page_size=10, **kwargs):
        queryset = StudentAttendance.objects.all().order_by('-created_at')

        if search:
            queryset = queryset.filter(name__icontains=search)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return StudentAttendancePaginatedType(**paginated_data)
