from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel
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
    room = models.ForeignKey(
        'structure.Room', 
        on_delete=models.CASCADE, 
        related_name='supervisions',
        verbose_name="Salle",
        null=True, blank=True
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
        unique_together = ['session', 'date', 'room', 'establishment']
        ordering = ['date', 'room']

    def __str__(self):
        return f"{self.date} - {self.room.name}"
