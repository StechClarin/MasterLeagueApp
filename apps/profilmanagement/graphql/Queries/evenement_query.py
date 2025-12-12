import graphene
from ..Types.evenement_type import EvenementType
from ...models import Evenement
from django.db.models import Q

from apps.core.graphql.Types.paginated_type import get_paginated_type

EvenementPaginatedType = get_paginated_type(EvenementType)

class EvenementQuery(graphene.ObjectType):
    evenement = graphene.Field(EvenementType, id=graphene.ID(required=True))
    evenements = graphene.Field(
        EvenementPaginatedType,
        search=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_evenement(root, info, id):
        try:
            return Evenement.objects.get(pk=id)
        except Evenement.DoesNotExist:
            return None

    def resolve_evenements(root, info, search=None, page=1, page_size=10, **kwargs):
        queryset = Evenement.objects.filter(is_deleted=False).order_by('-created_at')

        if search:
            queryset = queryset.filter(
                Q(nom__icontains=search) | 
                Q(lieu__icontains=search)
            )

        # 3. Pagination via Utility
        from apps.core.utils.pagination import paginate_queryset
        paginated_data = paginate_queryset(queryset, page, page_size)

        return EvenementPaginatedType(**paginated_data)
