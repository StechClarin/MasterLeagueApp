import graphene
from graphene_django.types import DjangoObjectType
from ...models.maintenance_record import MaintenanceRecord

class MaintenanceRecordType(DjangoObjectType):
    class Meta:
        model = MaintenanceRecord
        fields = "__all__"
