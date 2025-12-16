import graphene
from graphene_django.types import DjangoObjectType
from ...models.classroom import ClassRoom

class ClassRoomType(DjangoObjectType):
    class Meta:
        model = ClassRoom
        fields = "__all__"
