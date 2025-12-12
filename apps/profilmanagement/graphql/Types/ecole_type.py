import graphene
from graphene_django import DjangoObjectType
from ...models import Ecole

class EcoleType(DjangoObjectType):
    class Meta:
        model = Ecole
        fields = "__all__"
