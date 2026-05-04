import graphene
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.attendancesession_type import AttendanceSessionType
from ...models import AttendanceSession

AttendanceSessionPaginatedType = get_paginated_type(AttendanceSessionType)

class AttendanceSessionQuery(graphene.ObjectType):
    attendancesession = graphene.Field(AttendanceSessionType, id=graphene.ID(required=True))
    attendancesessions = graphene.Field(
        AttendanceSessionPaginatedType,
        search=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_attendancesession(root, info, id):
        try:
            return AttendanceSession.objects.get(pk=id)
        except AttendanceSession.DoesNotExist:
            return None

    def resolve_attendancesessions(root, info, search=None, page=1, page_size=10, **kwargs):
        queryset = AttendanceSession.objects.all().order_by('-created_at')

        if search:
            queryset = queryset.filter(name__icontains=search)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return AttendanceSessionPaginatedType(**paginated_data)
