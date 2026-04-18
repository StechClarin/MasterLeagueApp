# apps/core/graphql/Queries/establishment_membership_query.py
import graphene
from ..Types.establishment_membership_type import EstablishmentMembershipType
from ..Types.paginated_type import get_paginated_type
from apps.core.models import EstablishmentMembership
from apps.core.utils.pagination import paginate_queryset

class EstablishmentMembershipQuery(graphene.ObjectType):
    memberships = graphene.Field(
        get_paginated_type(EstablishmentMembershipType),
        user_id=graphene.ID(),
        establishment_id=graphene.ID(),
        status=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )
    membership = graphene.Field(EstablishmentMembershipType, id=graphene.ID(required=True))

    def resolve_memberships(self, info, page=1, page_size=10, **kwargs):
        user = info.context.user
        if not user.is_authenticated:
            return None
            
        queryset = EstablishmentMembership.objects.all().order_by('-created_at')
        
        # Filtres
        user_id = kwargs.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
            
        establishment_id = kwargs.get('establishment_id')
        if establishment_id:
            queryset = queryset.filter(establishment_id=establishment_id)
            
        status = kwargs.get('status')
        if status:
            queryset = queryset.filter(status=status)

        return paginate_queryset(queryset, page, page_size)

    def resolve_membership(self, info, id):
        user = info.context.user
        if not user.is_authenticated:
            return None
        try:
            return EstablishmentMembership.objects.get(pk=id)
        except EstablishmentMembership.DoesNotExist:
            return None
