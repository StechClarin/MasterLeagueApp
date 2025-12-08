import graphene
from ..Types.role_type import RoleType
from ...models import Role

class RoleQuery(graphene.ObjectType):
    role = graphene.Field(RoleType, id=graphene.ID(required=True))
    roles = graphene.List(RoleType, name=graphene.String(required=False))

    def resolve_role(root, info, id):
        try:
            return Role.objects.get(pk=id)
        except Role.DoesNotExist:
            return None

    def resolve_roles(root, info, name=None, **kwargs):
        queryset = Role.objects.all()
        if name:
            queryset = queryset.filter(name__icontains=name)
        return queryset
