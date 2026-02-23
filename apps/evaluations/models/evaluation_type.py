from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel


class EvaluationType(EstablishmentAwareModel):
    """
    Définit un type d'évaluation (ex: Devoir, Composition, Examen).
    """
    name = models.CharField(max_length=100)
    default_coefficient = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=1.0,
        help_text="Coefficient par défaut appliqué à ce type d'épreuve"
    )
    description = models.TextField(null=True, blank=True)

    class Meta:
        verbose_name = "Type d'Évaluation"
        verbose_name_plural = "Types d'Évaluation"
        unique_together = ['name', 'establishment']

    def __str__(self):
        return self.name
