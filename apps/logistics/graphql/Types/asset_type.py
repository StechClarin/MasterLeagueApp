import graphene
from graphene_django.types import DjangoObjectType
from ...models.asset import Asset

class AssetType(DjangoObjectType):
    next_maintenance_date = graphene.Date()

    class Meta:
        model = Asset
        fields = "__all__"

    def resolve_next_maintenance_date(self, info):
        return self.next_maintenance_date
