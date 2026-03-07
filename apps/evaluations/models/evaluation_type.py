from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel


class EvaluationType(EstablishmentAwareModel):
    """
    Définit un type d'évaluation (ex: Devoir, Composition, Examen).
    """
    name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)

    class Meta:
        verbose_name = "Type d'Évaluation"
        verbose_name_plural = "Types d'Évaluation"
        unique_together = ['name', 'establishment']

    def __str__(self):
        return self.name
