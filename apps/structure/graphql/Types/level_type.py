import graphene
from graphene_django.types import DjangoObjectType
from ...models.level import Level
from ..Types.classroom_type import ClassRoomType
from ...models.academic_year import AcademicYear

class LevelType(DjangoObjectType):
    class Meta:
        model = Level
        fields = "__all__"

    classes = graphene.List(lambda: ClassRoomType, year=graphene.String())

    def resolve_classes(self, info, year=None):
        queryset = self.classrooms.all()
        
        if year == 'CURRENT':
            # On cherche l'année active de l'établissement du niveau
            active_year = AcademicYear.objects.filter(establishment=self.establishment, is_active=True).first()
            if active_year:
                queryset = queryset.filter(academic_year=active_year)
            else:
                return queryset.none() # Aucune année active = pas de classes
        elif year:
            # Filtrage par ID d'année si un ID est passé
            queryset = queryset.filter(academic_year__id=year)
            
        return queryset
