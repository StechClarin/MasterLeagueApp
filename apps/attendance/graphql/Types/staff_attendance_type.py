import graphene
from graphene_django.types import DjangoObjectType
from ...models import StaffAttendance

class StaffAttendanceType(DjangoObjectType):
    class Meta:
        model = StaffAttendance
        fields = "__all__"
