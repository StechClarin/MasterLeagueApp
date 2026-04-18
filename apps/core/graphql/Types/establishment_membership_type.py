# apps/core/graphql/Types/establishment_membership_type.py
from graphene_django import DjangoObjectType
from apps.core.models import EstablishmentMembership

class EstablishmentMembershipType(DjangoObjectType):
    class Meta:
        model = EstablishmentMembership
        fields = "__all__"
