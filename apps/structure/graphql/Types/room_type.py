import graphene
from graphene_django.types import DjangoObjectType
from ...models import Room

class RoomType(DjangoObjectType):
    class Meta:
        model = Room
        fields = "__all__"
