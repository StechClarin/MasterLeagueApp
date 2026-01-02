import graphene
from graphene_django.types import DjangoObjectType
from ...models.student_health import StudentHealth

class StudentHealthType(DjangoObjectType):
    class Meta:
        model = StudentHealth
        fields = "__all__"
