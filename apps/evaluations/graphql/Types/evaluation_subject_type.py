import graphene
from graphene_django.types import DjangoObjectType
from ...models import EvaluationSubject

class LevelCoefficientType(graphene.ObjectType):
    level_id = graphene.Int()
    coefficient = graphene.Decimal()

class EvaluationSubjectType(DjangoObjectType):
    coefficient = graphene.Decimal()
    level_coefficients = graphene.List(LevelCoefficientType)

    class Meta:
        model = EvaluationSubject
        fields = "__all__"

    def resolve_coefficient(self, info):
        # Fallback for existing UI
        from apps.structure.models.level_subject import LevelSubject
        first_level = self.levels.first()
        if first_level:
            ls = LevelSubject.objects.filter(level=first_level, subject=self.subject).first()
            if ls:
                return ls.coefficient
        return 1.0

    def resolve_level_coefficients(self, info):
        from apps.structure.models.level_subject import LevelSubject
        # On récupère tous les coefficients pour tous les niveaux ciblés par cette épreuve
        levels = self.levels.all()
        lcs = []
        for level in levels:
            ls = LevelSubject.objects.filter(level=level, subject=self.subject).first()
            if ls:
                lcs.append(LevelCoefficientType(level_id=level.id, coefficient=ls.coefficient))
        return lcs
