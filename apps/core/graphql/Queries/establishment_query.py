import graphene
from ..Types.establishment_type import EstablishmentType
from ..Types.paginated_type import get_paginated_type
from apps.core.models import Establishment
from apps.core.utils.pagination import paginate_queryset

from django.db.models import Q

class EstablishmentQuery(graphene.ObjectType):
    establishments = graphene.Field(
        get_paginated_type(EstablishmentType),
        search=graphene.String(),
        city=graphene.String(),
        phone=graphene.String(),
        is_active=graphene.Boolean(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )
    establishment = graphene.Field(EstablishmentType, id=graphene.ID(required=True))

    def resolve_establishments(self, info, search=None, page=1, page_size=10, **kwargs):
        user = info.context.user
        if not user.is_authenticated:
            return None # Or an empty paginated response, depending on the error handling policy
            
        queryset = Establishment.objects.filter(user=user).order_by('name')
        
        # 1. Global Search "FIND" (OR conditions)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(city__icontains=search) |
                Q(phone__icontains=search)
            )

        # 2. Specific Filters (AND conditions)
        city = kwargs.get('city')
        if city:
            queryset = queryset.filter(city__icontains=city)
            
        phone = kwargs.get('phone')
        if phone:
            queryset = queryset.filter(phone__icontains=phone)

        is_active = kwargs.get('is_active')
        if is_active is not None:
             queryset = queryset.filter(is_active=is_active)

        return paginate_queryset(queryset, page, page_size)

    def resolve_establishment(self, info, id):
        user = info.context.user
        if not user.is_authenticated:
            return None
        try:
            return Establishment.objects.get(pk=id, user=user)
        except Establishment.DoesNotExist:
            return None
