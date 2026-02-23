import graphene
from graphene_django.types import DjangoObjectType
from ...models import AcademicPeriod

class AcademicPeriodType(DjangoObjectType):
    class Meta:
        model = AcademicPeriod
        fields = "__all__"
