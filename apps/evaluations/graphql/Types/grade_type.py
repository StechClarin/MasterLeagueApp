import graphene
from graphene_django.types import DjangoObjectType
from ...models import Grade

class GradeType(DjangoObjectType):
    class Meta:
        model = Grade
        fields = "__all__"
