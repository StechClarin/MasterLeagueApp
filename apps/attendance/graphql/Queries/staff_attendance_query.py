import graphene
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.staffattendance_type import StaffAttendanceType
from ...models import StaffAttendance

StaffAttendancePaginatedType = get_paginated_type(StaffAttendanceType)

class StaffAttendanceQuery(graphene.ObjectType):
    staffattendance = graphene.Field(StaffAttendanceType, id=graphene.ID(required=True))
    staffattendances = graphene.Field(
        StaffAttendancePaginatedType,
        search=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_staffattendance(root, info, id):
        try:
            return StaffAttendance.objects.get(pk=id)
        except StaffAttendance.DoesNotExist:
            return None

    def resolve_staffattendances(root, info, search=None, page=1, page_size=10, **kwargs):
        queryset = StaffAttendance.objects.all().order_by('-created_at')

        if search:
            queryset = queryset.filter(name__icontains=search)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return StaffAttendancePaginatedType(**paginated_data)
