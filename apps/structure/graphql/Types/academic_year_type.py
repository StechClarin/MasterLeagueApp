import graphene
from graphene_django.types import DjangoObjectType
from ...models.academic_year import AcademicYear

class AcademicYearType(DjangoObjectType):
    # On force le snake_case pour correspondre à la requête frontend révisée
    start_date = graphene.Date(name='start_date', source='start_date')
    end_date = graphene.Date(name='end_date', source='end_date')

    cycle_configs = graphene.List("apps.structure.graphql.Types.academic_cycle_config_type.AcademicCycleConfigType")
    
    class Meta:
        model = AcademicYear
        # On exclut les champs automatiques pour éviter que Graphene génère startDate/endDate
        exclude = () # Les champs custom ci-dessus priment déjà

    def resolve_cycle_configs(parent, info):
        return list(parent.cycle_configs.all())
