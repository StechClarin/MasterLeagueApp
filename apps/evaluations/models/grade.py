from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from apps.core.models.establishment_aware_model import EstablishmentAwareModel
from apps.students.models import Student
from .evaluation_subject import EvaluationSubject

class Grade(EstablishmentAwareModel):
    """
    La Note d'un élève pour une épreuve spécifique.
    """
    student = models.ForeignKey(
        Student, 
        on_delete=models.CASCADE, 
        related_name='grades'
    )
    evaluation_subject = models.ForeignKey(
        EvaluationSubject, 
        on_delete=models.CASCADE, 
        related_name='grades',
        verbose_name="Épreuve",
        null=True, blank=True
    )
    value = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, blank=True,
        help_text="Note obtenue",
        validators=[MinValueValidator(0), MaxValueValidator(20)]
    )
    comment = models.TextField(null=True, blank=True)
    
    # Suivi de présence spécifique à l'épreuve
    is_absent = models.BooleanField(
        default=False, 
        help_text="Marquer si l'élève était absent à l'évaluation"
    )

    class Meta:
        verbose_name = "Note"
        verbose_name_plural = "Notes"
        # Contrainte industrielle : un élève, une épreuve, une seule note par établissement.
        unique_together = ['student', 'evaluation_subject', 'establishment']
        ordering = ['evaluation_subject', 'student']

    def __str__(self):
        status = "ABS" if self.is_absent else self.value
        # Use evaluation_subject instead of evaluation
        session_title = self.evaluation_subject.session.title if self.evaluation_subject else "Sans Session"
        return f"{self.student} - {session_title} : {status}"
