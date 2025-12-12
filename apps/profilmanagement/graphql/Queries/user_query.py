import graphene
from django.core.paginator import Paginator
from ...models import User
from ..Types.user_type import UserType

class UserPaginatedType(graphene.ObjectType):
    items = graphene.List(UserType)
    total_count = graphene.Int()
    num_pages = graphene.Int()
    current_page = graphene.Int()
    page_size = graphene.Int()

class UserQuery(graphene.ObjectType):
    users = graphene.Field(
        UserPaginatedType,
        username=graphene.String(),
        email=graphene.String(),
        role=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )
    user = graphene.Field(UserType, id=graphene.Int())

    @staticmethod
    def resolve_users(root, info, **kwargs):
        # On instancie le service
        from ...services.user_service import UserService
        service = UserService()
        
        # Construction des filtres avec les bons lookups (icontains)
        filters = {}
        if kwargs.get('username'):
            filters['username__icontains'] = kwargs['username']
        if kwargs.get('email'):
            filters['email__icontains'] = kwargs['email']
        if kwargs.get('role'):
            filters['roles__name__iexact'] = kwargs['role']

        # On délègue le filtrage au service
        queryset = service.list(filters=filters)
        
        # On gère le tri par défaut
        queryset = queryset.order_by('-date_joined')

        # Pagination
        page = kwargs.get('page', 1)
        page_size = kwargs.get('page_size', 10)
        
        paginator = Paginator(queryset, page_size)
        
        try:
            page_obj = paginator.page(page)
        except:
            page_obj = paginator.page(1)

        return UserPaginatedType(
            items=page_obj.object_list,
            total_count=paginator.count,
            num_pages=paginator.num_pages,
            current_page=page_obj.number,
            page_size=page_size
        )

    @staticmethod
    def resolve_user(root, info, id):
        from ...services.user_service import UserService
        service = UserService()
        try:
            return service.get_by_id(id)
        except Exception:
            return None
