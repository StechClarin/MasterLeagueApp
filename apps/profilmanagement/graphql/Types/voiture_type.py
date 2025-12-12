import graphene
from graphene_django.types import DjangoObjectType
from ...models import Voiture

class VoitureType(DjangoObjectType):
    class Meta:
        model = Voiture
        fields = "__all__"
