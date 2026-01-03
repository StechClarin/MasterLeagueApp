import graphene
from graphene_django.types import DjangoObjectType
from ...models import ContractType

class ContractTypeType(DjangoObjectType):
    class Meta:
        model = ContractType
        fields = "__all__"
