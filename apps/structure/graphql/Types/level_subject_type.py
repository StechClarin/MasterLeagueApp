import graphene
from graphene_django import DjangoObjectType
from ...models.level_subject import LevelSubject

class LevelSubjectType(DjangoObjectType):
    class Meta:
        model = LevelSubject
        fields = "__all__"
