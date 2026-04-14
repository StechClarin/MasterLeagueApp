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
        queryset = Option.objects.all().order_by('-created_at')

        # Multi-tenant filter
        if establishmentId:
            queryset = queryset.filter(establishment_id=establishmentId)
        elif hasattr(info.context, 'user') and info.context.user.is_authenticated:
            # Fallback to current user's establishments if possible, 
            # or just rely on explicit establishmentId from frontend
            pass 

        if search:
            queryset = queryset.filter(name__icontains=search)
            
        if parentId:
            queryset = queryset.filter(parent_id=parentId)
        elif parentId == "": # Explicitly looking for root options
            queryset = queryset.filter(parent__isnull=True)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return OptionPaginatedType(**paginated_data)
