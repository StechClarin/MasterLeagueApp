from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel
from .fee_definition import FeeCategory

class InvoiceStatus(models.TextChoices):
    UNPAID = 'UNPAID', 'Impayé'
    PARTIAL = 'PARTIAL', 'Partiel'
    PAID = 'PAID', 'Payé'
    CANCELLED = 'CANCELLED', 'Annulé'

class Invoice(EstablishmentAwareModel):
    """
    Facture générée pour un élève (souvent suite à une inscription).
    """
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='invoices')
    enrollment = models.ForeignKey('students.Enrollment', on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    
    title = models.CharField(max_length=200)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    reference = models.CharField(max_length=50, unique=True, blank=True, null=True)
    due_date = models.DateField(null=True, blank=True)
    
    # Suivi des tranches pour la facture
    installment_count = models.PositiveIntegerField(default=1, help_text="Nombre de tranches prévu pour ce frais")
    
    status = models.CharField(max_length=20, choices=InvoiceStatus.choices, default=InvoiceStatus.UNPAID)
    
    category = models.CharField(max_length=50, choices=FeeCategory.choices, default=FeeCategory.TUITION)

    class Meta:
        verbose_name = "Facture"
        verbose_name_plural = "Factures"

    def __str__(self):
        return f"FACT-{self.id} : {self.student} ({self.total_amount})"

    @property
    def remaining_amount(self):
        return self.total_amount - self.paid_amount

    def update_status(self):
        if self.paid_amount >= self.total_amount:
            self.status = InvoiceStatus.PAID
        elif self.paid_amount > 0:
            self.status = InvoiceStatus.PARTIAL
        else:
            self.status = InvoiceStatus.UNPAID
        self.save()
