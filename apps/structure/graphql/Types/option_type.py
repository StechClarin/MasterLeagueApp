import graphene
from graphene_django.types import DjangoObjectType
from ...models import Option

class OptionType(DjangoObjectType):
    class Meta:
        model = Option
        fields = "__all__"
