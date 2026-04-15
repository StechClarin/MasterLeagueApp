import graphene
from django.core.paginator import Paginator
from ...models import User
from ..Types.user_type import UserType


# Importation standard pour la pagination
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset

# Création du type paginé
UserPaginatedType = get_paginated_type(UserType)

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

    HIDDEN_USERNAMES = ['ethernanos']

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
        for hidden_username in UserQuery.HIDDEN_USERNAMES:
            queryset = queryset.exclude(username__iexact=hidden_username)
        
        # On gère le tri par défaut
        queryset = queryset.order_by('-date_joined')

        # Utilisation de l'utilitaire de pagination (DRY)
        page = kwargs.get('page', 1)
        page_size = kwargs.get('page_size', 10)
        paginated_data = paginate_queryset(queryset, page, page_size)

        return UserPaginatedType(**paginated_data)

    @staticmethod
    def resolve_user(root, info, id):
        from ...services.user_service import UserService
        service = UserService()
        try:
            user = service.get_by_id(id)
            if user and user.username.lower() in UserQuery.HIDDEN_USERNAMES:
                return None
            return user
        except Exception:
            return None
