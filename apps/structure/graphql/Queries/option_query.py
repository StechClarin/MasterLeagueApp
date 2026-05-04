import graphene
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.option_type import OptionType
from ...models import Option

OptionPaginatedType = get_paginated_type(OptionType)

class OptionQuery(graphene.ObjectType):
    option = graphene.Field(OptionType, id=graphene.ID(required=True))
    options = graphene.Field(
        OptionPaginatedType,
        search=graphene.String(),
        parentId=graphene.ID(),
        establishmentId=graphene.ID(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_option(root, info, id):
        try:
            return Option.objects.get(pk=id)
        except Option.DoesNotExist:
            return None

    def resolve_options(root, info, search=None, parentId=None, establishmentId=None, page=1, page_size=10, **kwargs):
        # Multi-tenant filter (Priorité au middleware)
        context_est_id = getattr(info.context, 'establishment_id', None)
        active_est_id = context_est_id or establishmentId

        queryset = Option.objects.all().order_by('-created_at')

        if active_est_id:
            queryset = queryset.filter(establishment_id=active_est_id)
        elif hasattr(info.context, 'user') and info.context.user.is_authenticated:
            # Fallback de sécurité : on ne montre rien si pas d'établissement identifié
            # Sauf pour les super-utilisateurs (optionnel)
            if not info.context.user.is_superuser:
                queryset = queryset.none()

        if search:
            queryset = queryset.filter(name__icontains=search)
            
        if parentId:
            queryset = queryset.filter(parent_id=parentId)
        elif parentId == "": # Explicitly looking for root options
            queryset = queryset.filter(parent__isnull=True)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return OptionPaginatedType(**paginated_data)
