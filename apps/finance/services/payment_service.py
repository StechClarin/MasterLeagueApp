from apps.core.services.BaseService import BaseService
from apps.finance.models import Payment

class PaymentService(BaseService):
    model = Payment
    export_fields = ['invoice__title', 'amount', 'payment_date', 'payment_method', 'reference']

    def before_validate(self, data, instance=None):
        data = super().before_validate(data, instance)
        
        # Validation stricte des règles de paiement
        from decimal import Decimal
        from rest_framework.exceptions import ValidationError
        
        amount = Decimal(str(data.get('amount', 0)))
        invoice_id = data.get('invoice')
        
        if invoice_id:
            from apps.finance.models import Invoice
            try:
                # Si data.get('invoice') est un dictionnaire (serializer imbriqué), on récupère l'id
                if isinstance(invoice_id, dict):
                    invoice_id = invoice_id.get('id')
                invoice = Invoice.objects.get(pk=invoice_id)
                
                # Règle 1: Ne pas payer plus que le reste
                if amount > invoice.remaining_amount:
                    raise ValidationError(f"Le montant versé ({amount}) dépasse le reste à payer ({invoice.remaining_amount}).")
                
                # Règle 2: Paiement Unique strict
                if invoice.installment_count == 1 and amount < invoice.remaining_amount:
                    raise ValidationError("Ce frais exige un paiement unique et total. Les versements partiels sont interdits.")
                    
            except Invoice.DoesNotExist:
                pass # Géré par le serializer de base
                
        return data

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
