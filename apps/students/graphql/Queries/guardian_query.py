import graphene
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.guardian_type import GuardianType
from ...models import Guardian

GuardianPaginatedType = get_paginated_type(GuardianType)

class GuardianQuery(graphene.ObjectType):
    guardian = graphene.Field(GuardianType, id=graphene.ID(required=True))
    guardians = graphene.Field(
        GuardianPaginatedType,
        search=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_guardian(root, info, id):
        try:
            return Guardian.objects.get(pk=id)
        except Guardian.DoesNotExist:
            return None

    def resolve_guardians(root, info, search=None, page=1, page_size=10, **kwargs):
        queryset = Guardian.objects.all().order_by('-created_at')

        if search:
            queryset = queryset.filter(name__icontains=search)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return GuardianPaginatedType(**paginated_data)
