import graphene
from graphene_django.types import DjangoObjectType
from ...models import Planning

class PlanningType(DjangoObjectType):
    class Meta:
        model = Planning
        fields = "__all__"
