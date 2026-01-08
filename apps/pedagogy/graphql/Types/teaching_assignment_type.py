from graphene_django.types import DjangoObjectType
from ...models import TeachingAssignment

class TeachingAssignmentType(DjangoObjectType):
    class Meta:
        model = TeachingAssignment
        fields = "__all__"
