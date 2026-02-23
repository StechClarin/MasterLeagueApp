from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel
from apps.students.models import Student
from .evaluation import Evaluation


class Grade(EstablishmentAwareModel):
    """
    La Note d'un élève pour une évaluation spécifique.
    """
    student = models.ForeignKey(
        Student, 
        on_delete=models.CASCADE, 
        related_name='grades'
    )
    evaluation = models.ForeignKey(
        Evaluation, 
        on_delete=models.CASCADE, 
        related_name='grades'
    )
    value = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, blank=True,
        help_text="Note obtenue"
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
        # Contrainte industrielle : un élève, une évaluation, une seule note par établissement.
        unique_together = ['student', 'evaluation', 'establishment']
        ordering = ['evaluation', 'student']

    def __str__(self):
        status = "ABS" if self.is_absent else self.value
        return f"{self.student} - {self.evaluation.title} : {status}"
