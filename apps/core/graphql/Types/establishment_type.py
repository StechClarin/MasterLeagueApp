from graphene_django import DjangoObjectType
from apps.core.models import Establishment

class EstablishmentType(DjangoObjectType):
    class Meta:
        model = Establishment
        fields = "__all__"
