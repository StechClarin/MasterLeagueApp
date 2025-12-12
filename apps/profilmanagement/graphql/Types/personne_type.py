import graphene
from graphene_django.types import DjangoObjectType
from ...models import Personne

class PersonneType(DjangoObjectType):
    class Meta:
        model = Personne
        fields = "__all__"
