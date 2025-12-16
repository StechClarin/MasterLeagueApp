import graphene
from ..Types.establishment_type import EstablishmentType
from ..Types.paginated_type import get_paginated_type
from apps.core.models import Establishment
from apps.core.utils.pagination import paginate_queryset

class EstablishmentQuery(graphene.ObjectType):
    establishments = graphene.Field(
        get_paginated_type(EstablishmentType),
        search=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )
    establishment = graphene.Field(EstablishmentType, id=graphene.ID(required=True))

    def resolve_establishments(self, info, search=None, page=1, page_size=10, **kwargs):
        queryset = Establishment.objects.all().order_by('name')
        
        if search:
            queryset = queryset.filter(name__icontains=search)

        return paginate_queryset(queryset, page, page_size)

    def resolve_establishment(self, info, id):
        return Establishment.objects.get(pk=id)
