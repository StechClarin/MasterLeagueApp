import graphene
from graphene_django.types import DjangoObjectType
from ...models import SubjectGroup

class SubjectGroupType(DjangoObjectType):
    class Meta:
        model = SubjectGroup
        fields = "__all__"
