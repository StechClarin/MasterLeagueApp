import os
from django.db import models
from django.utils.text import slugify
from apps.core.models.establishment_aware_model import EstablishmentAwareModel
from apps.structure.models import Level, Subject
from .evaluation import EvaluationSession

def generate_subject_filename(instance, filename):
    ext = os.path.splitext(filename)[1].lower()
    
    session_name = slugify(instance.session.title) if instance.session else "session"
    subject_name = slugify(instance.subject.name) if instance.subject else "matiere"
    
    level_name = "niveaux"
    if instance.pk:
        levels = instance.levels.all()
        if levels.exists():
            if levels.count() == 1:
                level_name = slugify(levels.first().name)
            else:
                level_name = "tronc-commun"
                
    new_filename = f"{session_name}_{subject_name}_{level_name}{ext}"
    return f"evaluations/subjects/{new_filename}"


class EvaluationSubject(EstablishmentAwareModel):
    """
    Une épreuve spécifique au sein d'une session (ex: Mathématiques pour les 6ème).
    """
    session = models.ForeignKey(
        EvaluationSession, 
        on_delete=models.CASCADE, 
        related_name='subjects'
    )
    subject = models.ForeignKey(
        Subject, 
        on_delete=models.CASCADE, 
        related_name='evaluation_subjects'
    )
    levels = models.ManyToManyField(
        Level, 
        related_name='evaluation_subjects', 
        blank=True,
        help_text="Niveaux concernés par cette épreuve"
    )
    
    max_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=20.0
    )
    subject_file = models.FileField(
        upload_to=generate_subject_filename,
        null=True, blank=True,
        help_text="Sujet de l'épreuve (PDF/Image)"
    )

    class Meta:
        verbose_name = "Épreuve d'Évaluation"
        verbose_name_plural = "Épreuves d'Évaluation"

    def __str__(self):
        return f"{self.session.title} - {self.subject.name}"
