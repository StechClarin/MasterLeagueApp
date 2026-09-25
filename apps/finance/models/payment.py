from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel

class PaymentMethod(models.TextChoices):
    CASH = 'CASH', 'Espèces'
    MOBILE_MONEY = 'MOBILE_MONEY', 'Mobile Money'
    BANK_TRANSFER = 'BANK_TRANSFER', 'Virement Bancaire'
    CHECK = 'CHECK', 'Chèque'

class Payment(EstablishmentAwareModel):
    """
    Enregistrement d'un encaissement.
    """
    invoice = models.ForeignKey('finance.Invoice', on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.CASH)
    reference = models.CharField(max_length=100, blank=True, help_text="Numéro de reçu ou réf transaction")
    
    received_by = models.ForeignKey('hr.Personnel', on_delete=models.SET_NULL, null=True, blank=True)
    
    note = models.TextField(blank=True)

    class Meta:
        verbose_name = "Paiement"
        verbose_name_plural = "Paiements"

    def __str__(self):
        return f"PAY-{self.id} : {self.amount} for {self.invoice.student}"

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new:
            from decimal import Decimal
            # Mettre à jour la facture liée
            self.invoice.paid_amount += Decimal(str(self.amount))
            self.invoice.update_status()

            # SI la facture concerne les frais d'inscription (REGISTRATION),
            # le paiement valide automatiquement le statut d'inscription de l'élève à 'REGISTERED' !
            inv = self.invoice
            if inv and (getattr(inv, 'category', '') == 'REGISTRATION' or 'inscription' in (getattr(inv, 'title', '') or '').lower()):
                enrollment = inv.enrollment or (
                    inv.student.enrollments.order_by('-created_at').first() if getattr(inv, 'student', None) else None
                )
                if enrollment and enrollment.status != 'REGISTERED':
                    enrollment.status = 'REGISTERED'
                    enrollment.save(update_fields=['status'])

