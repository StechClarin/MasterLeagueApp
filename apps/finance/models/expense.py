from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel
from .payment import PaymentMethod


class ExpenseCategory(models.TextChoices):
    SALARIES = 'SALARIES', 'Salaires'
    UTILITIES = 'UTILITIES', 'Factures (Eau, Élec, Internet)'
    MAINTENANCE = 'MAINTENANCE', 'Entretien & Réparations'
    SUPPLIES = 'SUPPLIES', 'Fournitures'
    TRANSPORT = 'TRANSPORT', 'Transport'
    COMMUNICATION = 'COMMUNICATION', 'Communication'
    AUTRE = 'AUTRE', 'Autre'


class Expense(EstablishmentAwareModel):
    """
    Enregistrement d'une dépense de l'établissement.
    """
    title = models.CharField(max_length=200, verbose_name="Libellé de la dépense")
    category = models.CharField(
        max_length=50,
        choices=ExpenseCategory.choices,
        default=ExpenseCategory.AUTRE,
        verbose_name="Catégorie",
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Montant")
    expense_date = models.DateField(verbose_name="Date de la dépense")
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.CASH,
        verbose_name="Mode de paiement",
    )
    reference = models.CharField(max_length=100, blank=True, verbose_name="Référence / Justificatif")
    description = models.TextField(blank=True, verbose_name="Description")

    class Meta:
        verbose_name = "Dépense"
        verbose_name_plural = "Dépenses"
        ordering = ['-expense_date']

    def __str__(self):
        return f"{self.title} ({self.amount})"
