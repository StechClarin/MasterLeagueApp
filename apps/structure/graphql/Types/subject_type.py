import graphene
from graphene_django.types import DjangoObjectType
from ...models.subject import Subject
from .level_subject_type import LevelSubjectType

class SubjectType(DjangoObjectType):
    level_subjects = graphene.List(LevelSubjectType)

    class Meta:
        model = Subject
        fields = "__all__"

    def resolve_level_subjects(self, info):
        return self.level_subjects.all()
