from apps.core.services.BaseService import BaseService
from apps.finance.models import Payment

class PaymentService(BaseService):
    model = Payment
    export_fields = ['invoice__title', 'amount', 'payment_date', 'payment_method', 'reference']

    def before_save(self, data, instance=None):
        data = super().before_save(data, instance)
        
        # Génération de la référence de reçu si nouvelle
        if not instance and not data.get('reference'):
            data['reference'] = self.generate_payment_reference()
            
        return data

    def generate_payment_reference(self):
        from datetime import date
        year = date.today().year
        prefix = f"RCP-{year}-"
        
        last_payment = Payment.objects.filter(
            reference__startswith=prefix,
            establishment_id=self.establishment_id
        ).order_by('-reference').first()
        
        seq = 1
        if last_payment and last_payment.reference:
            try:
                seq = int(last_payment.reference.split('-')[-1]) + 1
            except (ValueError, IndexError):
                pass
                
        return f"{prefix}{seq:04d}"
    def get_student_financial_status(self, student_id):
        """
        Calcule la situation financière globale d'un élève.
        """
        from apps.finance.models import Invoice
        invoices = Invoice.objects.filter(
            student_id=student_id, 
            establishment_id=self.establishment_id
        )
        
        total_due = sum(i.total_amount for i in invoices)
        total_paid = sum(i.paid_amount for i in invoices)
        remaining = total_due - total_paid
        
        return {
            'total_due': total_due,
            'total_paid': total_paid,
            'remaining_total': remaining,
            'invoices_count': invoices.count()
        }

    def get_payment_history_for_invoice(self, invoice_id):
        """
        Récupère l'historique des paiements pour une facture donnée.
        """
        return Payment.objects.filter(invoice_id=invoice_id).order_by('payment_date')
