import graphene
from .academic_year_type import AcademicYearType
from .cycle_type import CycleType

class StructureResponseType(graphene.ObjectType):
    active_academic_year = graphene.Field(AcademicYearType)
    cycles = graphene.List(CycleType)
