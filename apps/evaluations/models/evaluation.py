from django.db import models
from django.conf import settings
from apps.core.models.establishment_aware_model import EstablishmentAwareModel
from apps.structure.models import Level, ClassRoom, Subject, Room, AcademicPeriod
from .evaluation_type import EvaluationType


class EvaluationSession(EstablishmentAwareModel):
    """
    La 'Session d'Évaluation' (ou Groupe) : centralise une période d'examens (ex: Séquence 1, Compo Trim 1).
    """
    SCOPE_CHOICES = [
        ('CLASS', 'Classe'),
        ('LEVEL', 'Niveau'),
        ('ESTABLISHMENT', 'Établissement'),
    ]

    STATUS_CHOICES = [
        ('DRAFT', 'Brouillon'),
        ('IN_PROGRESS', 'Saisie en cours'),
        ('COMPLETED', 'Saisie terminée'),
        ('LOCKED', 'Verrouillée'),
        ('CANCELLED', 'Annulée'),
    ]

    title = models.CharField(max_length=200)
    scope = models.CharField(max_length=20, choices=SCOPE_CHOICES, default='CLASS')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    
    academic_period = models.ForeignKey(
        AcademicPeriod, 
        on_delete=models.CASCADE, 
        related_name='evaluation_sessions'
    )
    
    # Type (ex: Séquence, Composition)
    evaluation_type = models.ForeignKey(
        EvaluationType, 
        on_delete=models.CASCADE, 
        related_name='evaluation_sessions'
    )

    class Meta:
        verbose_name = "Session d'Évaluation"
        verbose_name_plural = "Sessions d'Évaluation"
        ordering = ['-created_at']
        unique_together = ['title', 'academic_period', 'establishment']

    def __str__(self):
        return f"{self.title} ({self.academic_period.name})"
