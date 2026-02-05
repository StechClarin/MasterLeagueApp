from graphene_django.types import DjangoObjectType
from ...models.planningdetail import PlanningDetail

class PlanningDetailType(DjangoObjectType):
    class Meta:
        model = PlanningDetail
        fields = "__all__"
