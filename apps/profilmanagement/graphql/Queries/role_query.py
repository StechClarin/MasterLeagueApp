import strawberry
from ..Types.role_type import RoleType
from ...models import Role
from apps.core.graphql.Types.paginated_type import PaginatedType
from apps.core.utils.pagination import paginate_queryset

@strawberry.type
class RoleQuery:
    HIDDEN_ROLE_NAMES = ['Admin Master']

    @strawberry.field
    def role(self, id: strawberry.ID) -> RoleType | None:
        from ...services.role_service import RoleService
        service = RoleService()
        try:
            role = service.get_by_id(id)
            if role and role.name.lower() in [n.lower() for n in RoleQuery.HIDDEN_ROLE_NAMES]:
                return None
            return role
        except Exception:
            return None

    @strawberry.field
    def roles(
        self,
        name: str | None = None,
        page: int = 1,
        page_size: int = 10
    ) -> PaginatedType[RoleType]:
        from ...services.role_service import RoleService
        service = RoleService()
        
        # Le service attend un dictionnaire de filtres
        filters = {}
        if name:
            filters['name__icontains'] = name
            
        queryset = service.list(filters=filters)
        for hidden_role in RoleQuery.HIDDEN_ROLE_NAMES:
            queryset = queryset.exclude(name__iexact=hidden_role)

        # Tri stable obligatoire pour une pagination cohérente
        queryset = queryset.order_by('name')

        paginated_data = paginate_queryset(queryset, page, page_size)
        paginated_data['items'] = list(paginated_data['items'])
        return PaginatedType[RoleType](**paginated_data)
