import graphene
from graphene_django.types import DjangoObjectType
from ...models import Role

from apps.core.graphql.Types.permission_type import PermissionType

class RoleType(DjangoObjectType):
    class Meta:
        model = Role
        fields = "__all__"

    permissions = graphene.List(PermissionType)

    def resolve_permissions(self, info):
        # 1. Permissions directes
        direct_perms = self.permissions.all()
        
        # 2. Permissions via les groupes
        group_perms = PermissionType._meta.model.objects.filter(group__in=self.groups.all())
        
        # 3. Union (sans doublons)
        return (direct_perms | group_perms).distinct()
