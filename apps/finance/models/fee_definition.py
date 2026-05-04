from django.db import models
from django.core.validators import MinValueValidator
from apps.core.models.establishment_aware_model import EstablishmentAwareModel

class FeeCategory(models.TextChoices):
    REGISTRATION = 'REGISTRATION', 'Frais d\'Inscription'
    TUITION = 'TUITION', 'Scolarité'
    CANTEEN = 'CANTEEN', 'Cantine'
    TRANSPORT = 'TRANSPORT', 'Transport'
    OTHER = 'OTHER', 'Autre'

class PaymentModality(models.TextChoices):
    UNIQUE = 'UNIQUE', 'Paiement Unique'
    INSTALLMENTS = 'INSTALLMENTS', 'Paiement par Tranches'

class InstallmentPeriod(models.TextChoices):
    MONTHLY = 'MONTHLY', 'Mensuel'
    TRIMESTRIAL = 'TRIMESTRIAL', 'Trimestriel'
    SEMESTRIAL = 'SEMESTRIAL', 'Semestriel'

class FeeDefinition(EstablishmentAwareModel):
    """
    Définit les tarifs par niveau scolaire.
    """
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=FeeCategory.choices, default=FeeCategory.TUITION)
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    
    # Nouvelles modalités de paiement
    payment_modality = models.CharField(
        max_length=20, 
        choices=PaymentModality.choices, 
        default=PaymentModality.UNIQUE
    )
    installment_count = models.PositiveIntegerField(default=1, help_text="Nombre de tranches si applicable")
    installment_period = models.CharField(
        max_length=20, 
        choices=InstallmentPeriod.choices, 
        default=InstallmentPeriod.MONTHLY,
        null=True, blank=True
    )
    custom_installments = models.JSONField(
        null=True, blank=True,
        help_text="Format: [{'tranche': 1, 'amount': 50000}, {'tranche': 2, 'amount': 25000}]"
    )

    # Relation avec le niveau (Level) de l'app 'structure'
    level = models.ForeignKey('structure.Level', on_delete=models.CASCADE, verbose_name="Niveau", related_name="fees")
    option = models.ForeignKey('structure.Option', on_delete=models.CASCADE, null=True, blank=True, verbose_name="Option/Filière", related_name="fees")
    students = models.ManyToManyField('students.Student', blank=True, verbose_name="Élèves Spécifiques", related_name="special_fees")
    classroom = models.ForeignKey('structure.Classroom', on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Classe Spécifique", related_name="group_fees")
    academic_year = models.ForeignKey('structure.AcademicYear', on_delete=models.CASCADE, verbose_name="Année Académique")

    is_required = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Définition de Frais"
        verbose_name_plural = "Définitions de Frais"
        unique_together = ['level', 'option', 'category', 'academic_year', 'establishment']

    def __str__(self):
        return f"{self.name} - {self.level.name} ({self.amount} FCFA)"
