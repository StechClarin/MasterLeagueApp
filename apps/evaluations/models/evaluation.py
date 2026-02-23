from django.db import models
from django.conf import settings
from apps.core.models.establishment_aware_model import EstablishmentAwareModel
from apps.structure.models import Level, ClassRoom, Subject, Room, AcademicPeriod
from .evaluation_type import EvaluationType


class Evaluation(EstablishmentAwareModel):
    """
    Le 'Dossier de l'Épreuve' : centralise toute la configuration et la logistique d'un examen.
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
    ]

    title = models.CharField(max_length=200)
    scope = models.CharField(max_length=20, choices=SCOPE_CHOICES, default='CLASS')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    
    # Target
    academic_period = models.ForeignKey(
        AcademicPeriod, 
        on_delete=models.CASCADE, 
        related_name='evaluations'
    )
    # Ciblage flexible (Multi-classes ou Multi-niveaux pour les examens généraux)
    levels = models.ManyToManyField(Level, related_name='evaluations', blank=True)
    classrooms = models.ManyToManyField(ClassRoom, related_name='evaluations', blank=True)
    subject = models.ForeignKey(
        Subject, 
        on_delete=models.CASCADE, 
        related_name='evaluations'
    )
    
    # Type & Weight
    evaluation_type = models.ForeignKey(
        EvaluationType, 
        on_delete=models.CASCADE, 
        related_name='evaluations'
    )
    coefficient = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=1.0,
        help_text="Possibilité de forcer une valeur différente du type par défaut"
    )
    max_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=20.0,
        help_text="Note maximale (ex: 20, 100)"
    )
    
    # Logistics
    date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(
        null=True, blank=True, 
        help_text="Durée de l'épreuve en minutes"
    )
    room = models.ForeignKey(
        Room, 
        on_delete=models.SET_NULL, 
        null=True, blank=True,
        verbose_name="Salle d'examen"
    )
    
    # Metadata
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='created_evaluations'
    )
    # Surveillants (Personnel de l'établissement)
    supervisors = models.ManyToManyField(
        'hr.Personnel', 
        related_name='supervised_evaluations', 
        blank=True,
        verbose_name="Surveillants"
    )

    class Meta:
        verbose_name = "Évaluation"
        verbose_name_plural = "Évaluations"
        ordering = ['-date', '-created_at']
        unique_together = ['title', 'date', 'subject', 'establishment']

    def __str__(self):
        return f"{self.title} - {self.subject.name} ({self.get_scope_display()})"
