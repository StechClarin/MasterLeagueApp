import graphene
from graphene_django.types import DjangoObjectType
from ...models import StudentAttendance

class StudentAttendanceType(DjangoObjectType):
    class Meta:
        model = StudentAttendance
        fields = "__all__"
