from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel
from apps.structure.models import ClassRoom, Room
from .evaluation_subject import EvaluationSubject


class EvaluationPlanning(EstablishmentAwareModel):
    """
    Planification logistique d'une épreuve pour une ou plusieurs classes.
    """
    evaluation_subject = models.ForeignKey(
        EvaluationSubject, 
        on_delete=models.CASCADE, 
        related_name='plannings'
    )
    levels = models.ManyToManyField(
        'structure.Level', 
        related_name='evaluation_plannings', 
        blank=True,
        help_text="Niveaux concernés par cette planification"
    )
    classrooms = models.ManyToManyField(
        ClassRoom, 
        related_name='evaluation_plannings', 
        blank=True,
        verbose_name="Classes concernées"
    )
    rooms = models.ManyToManyField(
        Room,
        related_name='evaluation_plannings',
        blank=True,
        verbose_name="Salles physiques"
    )
    date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(
        null=True, blank=True, 
        help_text="Durée de l'épreuve en minutes"
    )
    
    # Gestion des annulations et reports
    is_cancelled = models.BooleanField(default=False, help_text="Marque cet examen comme annulé")
    rescheduled_to = models.DateField(null=True, blank=True, help_text="Date à laquelle l'examen a été reporté")
    
    class Meta:
        verbose_name = "Planification d'Épreuve"
        verbose_name_plural = "Planifications d'Épreuve"
        ordering = ['date', 'start_time']

    def __str__(self):
        return f"{self.evaluation_subject} - {self.date} {self.start_time}"
