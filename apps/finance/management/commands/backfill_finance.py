from django.core.management.base import BaseCommand
from django.db.transaction import atomic
from apps.finance.models import Invoice, Payment
from apps.finance.services.finance_service import FinanceService
from apps.finance.services.payment_service import PaymentService

class Command(BaseCommand):
    help = "Rattrapage des références manquantes pour les Factures et Paiements (Backfill)."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("--- Starting Backfill for Finance References ---"))
        
        finance_service = FinanceService()
        payment_service = PaymentService()
        
        # 1. Backfill Invoices
        invoices_to_fix = Invoice.objects.filter(reference__isnull=True) | Invoice.objects.filter(reference='')
        count_invoices = invoices_to_fix.count()
        self.stdout.write(f"Found {count_invoices} invoices to fix.")
        
        if count_invoices > 0:
            with atomic():
                for invoice in invoices_to_fix:
                    # On définit le contexte d'établissement pour la séquence
                    finance_service.set_context(None, invoice.establishment_id)
                    invoice.reference = finance_service.generate_invoice_reference()
                    invoice.save()
                    self.stdout.write(self.style.SUCCESS(f"  [OK] Updated Invoice {invoice.id}: {invoice.reference}"))

        # 2. Backfill Payments
        payments_to_fix = Payment.objects.filter(reference__isnull=True) | Payment.objects.filter(reference='')
        count_payments = payments_to_fix.count()
        self.stdout.write(f"Found {count_payments} payments to fix.")
        
        if count_payments > 0:
            with atomic():
                for payment in payments_to_fix:
                    payment_service.set_context(None, payment.establishment_id)
                    payment.reference = payment_service.generate_payment_reference()
                    payment.save()
                    self.stdout.write(self.style.SUCCESS(f"  [OK] Updated Payment {payment.id}: {payment.reference}"))

        self.stdout.write(self.style.SUCCESS("--- Backfill Completed ---"))
