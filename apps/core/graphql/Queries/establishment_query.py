import graphene
from ..Types.establishment_type import EstablishmentType
from ..Types.paginated_type import get_paginated_type
from apps.core.models import Establishment
from apps.core.utils.pagination import paginate_queryset

from django.db.models import Q
from django.core.exceptions import ObjectDoesNotExist

class EstablishmentQuery(graphene.ObjectType):
    establishments = graphene.Field(
        get_paginated_type(EstablishmentType),
        search=graphene.String(),
        city=graphene.String(),
        phone=graphene.String(),
        is_active=graphene.Boolean(),
        user_id=graphene.ID(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )
    establishment = graphene.Field(EstablishmentType, id=graphene.ID(required=True))

    def resolve_establishments(self, info, search=None, page=1, page_size=10, **kwargs):
        user = info.context.user
        if not user.is_authenticated:
            return None # Or an empty paginated response, depending on the error handling policy
            
        # 0. Base Filter (Access for owned or context membership establishments)
        user_id = kwargs.get('user_id')
        target_user_id = user_id if user_id else user.id
        
        if user.is_superuser:
            queryset = Establishment.objects.all().order_by('name')
        else:
            q_owner = Q(user_id=target_user_id)
            q_member = Q(memberships__user_id=target_user_id, memberships__status='active')
            queryset = Establishment.objects.filter(
                Q(q_owner, q_member, _connector=Q.OR)
            ).distinct().order_by('name')
        
        # 1. Global Search "FIND" (OR conditions)
        if search:
            q_name = Q(name__icontains=search)
            q_city = Q(city__icontains=search)
            q_phone = Q(phone__icontains=search)
            queryset = queryset.filter(
                Q(q_name, q_city, q_phone, _connector=Q.OR)
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
        if user.is_superuser:
            try:
                return Establishment.objects.get(pk=id)
            except ObjectDoesNotExist:
                return None
        try:
            q_owner = Q(user=user)
            q_member = Q(memberships__user=user, memberships__status='active')
            q_or = Q(q_owner, q_member, _connector=Q.OR)
            return Establishment.objects.filter(
                Q(pk=id),
                q_or
            ).distinct().get()
        except ObjectDoesNotExist:
            return None
