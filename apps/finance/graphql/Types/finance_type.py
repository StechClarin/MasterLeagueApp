import graphene
from graphene_django import DjangoObjectType
from apps.finance.models import FeeDefinition, Invoice, Payment

class FeeDefinitionType(DjangoObjectType):
    class Meta:
        model = FeeDefinition
        fields = "__all__"

class InvoiceType(DjangoObjectType):
    class Meta:
        model = Invoice
        fields = "__all__"
    
    remaining_amount = graphene.Decimal()

    def resolve_remaining_amount(self, info):
        return self.remaining_amount

class PaymentType(DjangoObjectType):
    class Meta:
        model = Payment
        fields = "__all__"
