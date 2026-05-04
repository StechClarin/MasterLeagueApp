from rest_framework import serializers
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

class InvoiceReadSerializer(BaseSerializer):
    payments = serializers.SerializerMethodField()
    
    class Meta:
        model = Invoice
        fields = '__all__'
        depth = 2
        
    def get_payments(self, obj):
        return PaymentSerializer(obj.payments.all(), many=True).data

class PaymentSerializer(BaseSerializer):
    """ Serializer pour l'ÉCRITURE (Validation) """
    class Meta:
        model = Payment
        fields = '__all__'

class PaymentReadSerializer(BaseSerializer):
    """ Serializer pour la LECTURE (Reçu, Liste) avec tous les détails """
    class Meta:
        model = Payment
        fields = '__all__'
        depth = 2
