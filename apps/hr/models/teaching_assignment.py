from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel

class TeachingAssignment(EstablishmentAwareModel):
    """
    Table pivot principale: Qui enseigne Quoi à Qui (et Quand).
    """
    teacher = models.ForeignKey(
        'hr.Teacher', 
        on_delete=models.CASCADE, 
        related_name='assignments'
    )
    classroom = models.ForeignKey(
        'structure.ClassRoom', 
        on_delete=models.CASCADE, 
        related_name='assignments'
    )
    subject = models.ForeignKey(
        'structure.Subject', 
        on_delete=models.CASCADE, 
        related_name='assignments'
    )
    academic_year = models.ForeignKey(
        'structure.AcademicYear', 
        on_delete=models.CASCADE, 
        related_name='assignments'
    )
    
    hours_scheduled = models.IntegerField(default=0, help_text="Heures prévues pour ce module")

    class Meta:
        verbose_name = "affectation pédagogique"
        verbose_name_plural = "affectations pédagogiques"
        constraints = [
            # Un seul prof par matière par classe pour une année donnée (Règle simplifiée, peut évoluer)
            # Ou plutôt: Une matière ne peut être enseignée qu'une fois dans une classe ?
            # Non, la contrainte unique est souvent (classe, matière, année) -> 1 prof principal.
            # Mais parfois il y a 2 profs (co-enseignement). Pour l'instant on garde (classe, matière, année) unique ?
            # Soyons souple: On autorise plusieurs affectations, mais on évite les doublons stricts.
            models.UniqueConstraint(
                fields=['teacher', 'classroom', 'subject', 'academic_year'], 
                name='unique_assignment'
            )
        ]

    def __str__(self):
        return f"{self.teacher} -> {self.subject} ({self.classroom})"
