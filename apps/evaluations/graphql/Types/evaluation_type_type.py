import graphene
from graphene_django.types import DjangoObjectType
from ...models import EvaluationType

class EvaluationTypeType(DjangoObjectType):
    class Meta:
        model = EvaluationType
        fields = "__all__"
