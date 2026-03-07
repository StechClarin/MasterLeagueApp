import graphene
from graphene_django.types import DjangoObjectType
from ...models import EvaluationSupervision

class EvaluationSupervisionType(DjangoObjectType):
    class Meta:
        model = EvaluationSupervision
        fields = "__all__"
