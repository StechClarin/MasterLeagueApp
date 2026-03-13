import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.finance.models import Invoice, Payment
from apps.finance.services.finance_service import FinanceService
from apps.finance.services.payment_service import PaymentService
from django.db import transaction

def backfill():
    print("--- Starting Backfill for Finance References ---")
    
    finance_service = FinanceService()
    payment_service = PaymentService()
    
    # 1. Backfill Invoices
    invoices_to_fix = Invoice.objects.filter(reference__isnull=True) | Invoice.objects.filter(reference='')
    print(f"Found {invoices_to_fix.count()} invoices to fix.")
    
    with transaction.atomic():
        for invoice in invoices_to_fix:
            # We need to set the context for establishment_id to generate correct sequence
            finance_service.set_context(None, invoice.establishment_id)
            invoice.reference = finance_service.generate_invoice_reference()
            invoice.save()
            print(f"Updated Invoice {invoice.id}: {invoice.reference}")

    # 2. Backfill Payments
    payments_to_fix = Payment.objects.filter(reference__isnull=True) | Payment.objects.filter(reference='')
    print(f"Found {payments_to_fix.count()} payments to fix.")
    
    with transaction.atomic():
        for payment in payments_to_fix:
            payment_service.set_context(None, payment.establishment_id)
            payment.reference = payment_service.generate_payment_reference()
            payment.save()
            print(f"Updated Payment {payment.id}: {payment.reference}")

    print("--- Backfill Completed ---")

if __name__ == "__main__":
    backfill()
