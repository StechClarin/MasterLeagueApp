import strawberry
from apps.core.models.permission import Permission
from apps.core.graphql.Types.permission_type import PermissionType

@strawberry.type
class PermissionQuery:
    @strawberry.field
    def permissions(self) -> list[PermissionType]:
        return list(Permission.objects.all().order_by('tag', 'name'))
