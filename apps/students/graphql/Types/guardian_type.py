import graphene
from graphene_django.types import DjangoObjectType
from ...models import Guardian

class GuardianType(DjangoObjectType):
    class Meta:
        model = Guardian
        fields = "__all__"
