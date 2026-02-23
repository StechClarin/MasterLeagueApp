from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel
from apps.structure.models.academic_year import AcademicYear


class AcademicPeriod(EstablishmentAwareModel):
    """
    Représente une période académique (ex: 1er Trimestre, 2ème Semestre).
    """
    name = models.CharField(max_length=100)
    academic_year = models.ForeignKey(
        AcademicYear, 
        on_delete=models.CASCADE, 
        related_name='periods'
    )
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(
        default=False, 
        help_text="Définit si c'est la période de saisie actuelle"
    )

    class Meta:
        verbose_name = "Période Académique"
        verbose_name_plural = "Périodes Académiques"
        ordering = ['academic_year', 'start_date']
        unique_together = ['name', 'academic_year', 'establishment']

    def __str__(self):
        return f"{self.name} - {self.academic_year.name}"
