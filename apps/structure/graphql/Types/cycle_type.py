import graphene
from graphene_django.types import DjangoObjectType
from ...models.cycle import Cycle

class CycleType(DjangoObjectType):
    class Meta:
        model = Cycle
        fields = "__all__"
