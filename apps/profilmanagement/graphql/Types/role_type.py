import strawberry
import strawberry_django
from ...models import Role
from apps.core.graphql.Types.permission_type import PermissionType
from apps.core.models.permission import Permission

@strawberry_django.type(Role)
class RoleType:
    id: strawberry.ID
    name: strawberry.auto

    @strawberry.field
    def permissions(self) -> list[PermissionType]:
        # 1. Permissions directes
        direct_perms = self.permissions.all()
        
        # 2. Permissions via les groupes
        group_perms = Permission.objects.filter(group__in=self.groups.all())
        
        # 3. Union (sans doublons)
        return list((direct_perms | group_perms).distinct())
