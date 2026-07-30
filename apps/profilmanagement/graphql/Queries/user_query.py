import strawberry
from django.core.paginator import Paginator
from ...models import User
from ..Types.user_type import UserType
from apps.core.graphql.Types.paginated_type import PaginatedType
from apps.core.utils.pagination import paginate_queryset

@strawberry.type
class UserQuery:
    HIDDEN_USERNAMES = ['ethernanos']

    @strawberry.field
    def users(
        self,
        info: strawberry.Info,
        username: str | None = None,
        email: str | None = None,
        role: str | None = None,
        is_active: bool | None = None,
        page: int = 1,
        page_size: int = 10
    ) -> PaginatedType[UserType]:
        from ...services.user_service import UserService
        service = UserService()
        
        filters = {}
        if username:
            filters['username__icontains'] = username
        if email:
            filters['email__icontains'] = email
        if role:
            filters['memberships__roles__name__iexact'] = role
        if is_active is not None:
            filters['is_active'] = is_active

        queryset = service.list(filters=filters)
        
        request = info.context.request if hasattr(info.context, 'request') else info.context
        est_id = getattr(request, 'establishment_id', None)
        if est_id:
            queryset = queryset.filter(memberships__establishment_id=est_id, memberships__status='active').distinct()

        for hidden_username in UserQuery.HIDDEN_USERNAMES:
            queryset = queryset.exclude(username__iexact=hidden_username)
        
        queryset = queryset.order_by('-date_joined')

        paginated_data = paginate_queryset(queryset, page, page_size)
        paginated_data['items'] = list(paginated_data['items'])
        return PaginatedType[UserType](**paginated_data)

    @strawberry.field
    def user(self, info: strawberry.Info, id: int) -> UserType | None:
        from ...services.user_service import UserService
        service = UserService()
        try:
            user = service.get_by_id(id)
            if user and user.username.lower() in UserQuery.HIDDEN_USERNAMES:
                return None
                
            request = info.context.request if hasattr(info.context, 'request') else info.context
            est_id = getattr(request, 'establishment_id', None)
            if est_id and user:
                has_access = user.memberships.filter(establishment_id=est_id, status='active').exists()
                if not has_access:
                    return None
                    
            return user
        except Exception:
            return None

    @strawberry.field
    def me(self, info: strawberry.Info) -> UserType | None:
        request = info.context.request if hasattr(info.context, 'request') else info.context
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            return user
        return None
