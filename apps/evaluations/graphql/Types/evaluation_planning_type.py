import graphene
from graphene_django.types import DjangoObjectType
from ...models import EvaluationPlanning

class EvaluationPlanningType(DjangoObjectType):
    class Meta:
        model = EvaluationPlanning
        fields = "__all__"
