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

    HIDDEN_ROLE_NAMES = ['Admin Master']

    def resolve_role(root, info, id):
        from ...services.role_service import RoleService
        service = RoleService()
        try:
            role = service.get_by_id(id)
            if role and role.name.lower() in [n.lower() for n in RoleQuery.HIDDEN_ROLE_NAMES]:
                return None
            return role
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
        for hidden_role in RoleQuery.HIDDEN_ROLE_NAMES:
            queryset = queryset.exclude(name__iexact=hidden_role)
        
        paginated_data = paginate_queryset(queryset, page, page_size)
        return RolePaginatedType(**paginated_data)
