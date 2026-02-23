import graphene
from graphene_django.types import DjangoObjectType
from ...models import Evaluation

class EvaluationType(DjangoObjectType):
    class Meta:
        model = Evaluation
        fields = "__all__"
