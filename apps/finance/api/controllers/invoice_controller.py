from apps.core.api.controllers.BaseController import BaseController
from apps.finance.models import Invoice
from apps.finance.api.serializers.finance_serializer import InvoiceSerializer
from apps.finance.services.invoice_service import InvoiceService

class InvoiceController(BaseController):
    serializer_class = InvoiceSerializer
    service_class = InvoiceService
