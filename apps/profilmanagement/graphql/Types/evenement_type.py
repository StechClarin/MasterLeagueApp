import graphene
from graphene_django.types import DjangoObjectType
from ...models import Evenement

class EvenementType(DjangoObjectType):
    class Meta:
        model = Evenement
        fields = "__all__"
