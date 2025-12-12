import graphene
from ..Types.voiture_type import VoitureType
from ...models import Voiture

from apps.core.graphql.Types.paginated_type import get_paginated_type

VoiturePaginatedType = get_paginated_type(VoitureType)

class VoitureQuery(graphene.ObjectType):
    voiture = graphene.Field(VoitureType, id=graphene.ID(required=True))
    voitures = graphene.Field(
        VoiturePaginatedType,
        search=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_voiture(root, info, id):
        try:
            return Voiture.objects.get(pk=id)
        except Voiture.DoesNotExist:
            return None

    def resolve_voitures(root, info, search=None, page=1, page_size=10, **kwargs):
        # 1. Base Query
        queryset = Voiture.objects.all().order_by('-created_at')

        # 2. Filters
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(matricule__icontains=search)
            )

        # 3. Pagination via Utility
        from apps.core.utils.pagination import paginate_queryset
        paginated_data = paginate_queryset(queryset, page, page_size)

        return VoiturePaginatedType(**paginated_data)
