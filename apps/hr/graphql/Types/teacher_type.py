import graphene
from graphene_django.types import DjangoObjectType
from ...models.teacher import Teacher

class TeacherType(DjangoObjectType):
    class Meta:
        model = Teacher
        fields = "__all__"
