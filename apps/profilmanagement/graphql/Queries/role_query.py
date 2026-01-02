import graphene
from ..Types.role_type import RoleType
from ...models import Role


from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset

RolePaginatedType = get_paginated_type(RoleType)

class RoleQuery(graphene.ObjectType):
    role = graphene.Field(RoleType, id=graphene.ID(required=True))
    roles = graphene.Field(
        RolePaginatedType,
        name=graphene.String(required=False),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_role(root, info, id):
        from ...services.role_service import RoleService
        service = RoleService()
        try:
            return service.get_by_id(id)
        except Exception:
            return None

    def resolve_roles(root, info, name=None, page=1, page_size=10, **kwargs):
        from ...services.role_service import RoleService
        service = RoleService()
        
        # Le service attend un dictionnaire de filtres
        filters = {}
        if name:
            filters['name__icontains'] = name
            
        queryset = service.list(filters=filters)
        
        paginated_data = paginate_queryset(queryset, page, page_size)
        return RolePaginatedType(**paginated_data)
