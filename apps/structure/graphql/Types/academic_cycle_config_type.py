import graphene
from graphene_django import DjangoObjectType
from apps.structure.models.academic_cycle_config import AcademicCycleConfig

class AcademicCycleConfigType(DjangoObjectType):
    class Meta:
        model = AcademicCycleConfig
        fields = "__all__"
