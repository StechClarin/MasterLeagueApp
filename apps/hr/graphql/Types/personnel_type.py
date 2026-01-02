import graphene
from graphene_django.types import DjangoObjectType
from ...models import Personnel

class PersonnelType(DjangoObjectType):
    class Meta:
        model = Personnel
        fields = "__all__"
