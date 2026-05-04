import graphene
from graphene_django.types import DjangoObjectType
from ...models import AttendanceSession

class AttendanceSessionType(DjangoObjectType):
    class Meta:
        model = AttendanceSession
        fields = "__all__"
