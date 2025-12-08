import graphene
from apps.core.models.permission import Permission
from apps.core.graphql.Types.permission_type import PermissionType

class PermissionQuery(graphene.ObjectType):
    permissions = graphene.List(PermissionType)

    def resolve_permissions(self, info):
        return Permission.objects.all().order_by('tag', 'name')
