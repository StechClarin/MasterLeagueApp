from apps.core.api.controllers.BaseController import BaseController
from apps.finance.models import Invoice
from apps.finance.api.serializers.finance_serializer import InvoiceSerializer, InvoiceReadSerializer
from apps.finance.services.invoice_service import InvoiceService

class InvoiceController(BaseController):
    serializer_class = InvoiceSerializer
    service_class = InvoiceService

    def get_serializer_class(self, action='read'):
        if action == 'read':
            return InvoiceReadSerializer
        return InvoiceSerializer

    def mark_printed(self, request, pk):
        """
        Incrémente le compteur d'impression d'une facture.
        Retourne `is_duplicate=True` si elle avait déjà été imprimée.
        """
        from rest_framework import status
        
        self.initial(request)
        invoice = self.service.get_by_id(pk)
        
        # On vérifie si c'est un duplicata (avant d'incrémenter)
        is_duplicate = invoice.print_count > 0
        
        # On incrémente et sauvegarde
        invoice.print_count += 1
        invoice.save(update_fields=['print_count'])
        
        return self.success_response(
            data={
                "print_count": invoice.print_count,
                "is_duplicate": is_duplicate
            },
            message="Impression enregistrée.",
            status_code=status.HTTP_200_OK
        )
