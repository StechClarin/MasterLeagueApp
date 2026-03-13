from apps.core.api.serializers.BaseSerializer import BaseSerializer
from apps.finance.models import FeeDefinition, Invoice, Payment

class FeeDefinitionSerializer(BaseSerializer):
    class Meta:
        model = FeeDefinition
        fields = '__all__'

class InvoiceSerializer(BaseSerializer):
    class Meta:
        model = Invoice
        fields = '__all__'

class PaymentSerializer(BaseSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
