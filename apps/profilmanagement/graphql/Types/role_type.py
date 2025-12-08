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
        return self.permissions.all()
