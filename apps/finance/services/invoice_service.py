from apps.core.services.BaseService import BaseService
from apps.finance.models import Invoice

class InvoiceService(BaseService):
    model = Invoice
    export_fields = ['title', 'student__matricule', 'student__last_name', 'total_amount', 'status', 'category']
    # Specific logic for invoices can be added here
