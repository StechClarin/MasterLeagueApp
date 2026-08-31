import graphene
from graphene_django.types import DjangoObjectType
from ...models.intervention_request import InterventionRequest

class InterventionRequestType(DjangoObjectType):
    class Meta:
        model = InterventionRequest
        fields = "__all__"
