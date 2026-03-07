from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel
from apps.structure.models import ClassRoom
from .evaluation import EvaluationSession


class EvaluationSupervision(EstablishmentAwareModel):
    """
    Plan de surveillance pour une classe à une date donnée au sein d'une session.
    Indépendant de la matière.
    """
    session = models.ForeignKey(
        EvaluationSession, 
        on_delete=models.CASCADE, 
        related_name='supervisions'
    )
    date = models.DateField()
    classroom = models.ForeignKey(
        ClassRoom, 
        on_delete=models.CASCADE, 
        related_name='supervisions',
        verbose_name="Classe (Salle)"
    )
    supervisors = models.ManyToManyField(
        'hr.Personnel', 
        related_name='supervisions', 
        blank=True,
        verbose_name="Surveillants"
    )

    class Meta:
        verbose_name = "Surveillance d'Évaluation"
        verbose_name_plural = "Surveillances d'Évaluation"
        unique_together = ['session', 'date', 'classroom', 'establishment']
        ordering = ['date', 'classroom']

    def __str__(self):
        return f"{self.date} - {self.classroom.name}"
