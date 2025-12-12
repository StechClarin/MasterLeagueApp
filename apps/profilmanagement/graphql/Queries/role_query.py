import graphene
from ..Types.role_type import RoleType
from ...models import Role

class RoleQuery(graphene.ObjectType):
    role = graphene.Field(RoleType, id=graphene.ID(required=True))
    roles = graphene.List(RoleType, name=graphene.String(required=False))

    def resolve_role(root, info, id):
        from ...services.role_service import RoleService
        service = RoleService()
        try:
            return service.get_by_id(id)
        except Exception:
            return None

    def resolve_roles(root, info, name=None, **kwargs):
        from ...services.role_service import RoleService
        service = RoleService()
        
        # Le service attend un dictionnaire de filtres
        filters = {}
        if name:
            filters['name__icontains'] = name
            
        return service.list(filters=filters)
