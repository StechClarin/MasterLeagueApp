from django.db import models

from apps.core.models.establishment_aware_model import EstablishmentAwareModel

class TeachingAssignment(EstablishmentAwareModel):
    """
    Table pivot principale: Qui enseigne Quoi à Qui (et Quand).
    Module Pedagogy.
    """
    teacher = models.ForeignKey(
        'hr.Teacher', 
        on_delete=models.CASCADE, 
        related_name='pedagogy_assignments'
    )
    classroom = models.ForeignKey(
        'structure.ClassRoom', 
        on_delete=models.CASCADE, 
        related_name='pedagogy_assignments'
    )
    subject = models.ForeignKey(
        'structure.Subject', 
        on_delete=models.CASCADE, 
        related_name='pedagogy_assignments'
    )
    academic_year = models.ForeignKey(
        'structure.AcademicYear', 
        on_delete=models.CASCADE, 
        related_name='pedagogy_assignments'
    )
    
    # Granularité Temporelle
    start_date = models.DateField(
        null=True, blank=True, 
        help_text="Date de début d'intervention. Si vide, correspond au début de l'année scolaire."
    )
    end_date = models.DateField(
        null=True, blank=True, 
        help_text="Date de fin d'intervention. Si vide, correspond à la fin de l'année scolaire."
    )
    
    hours_scheduled = models.IntegerField(default=0, help_text="Heures prévues pour ce module")

    class Meta:
        verbose_name = "affectation pédagogique"
        verbose_name_plural = "affectations pédagogiques"
        ordering = ['-academic_year', 'classroom', 'subject']
        constraints = [
            # On évite les doublons stricts (Même prof, même classe, même matière, même période ?)
            # Pour l'instant on garde une contrainte souple sans dates, ou on l'enlève pour permettre les remplacements.
            # L'utilisateur permets "remplacements", donc on peut avoir 2 profs sur la même classe/matière mais dates différentes.
            # Si on met une contrainte unique sans dates, ça bloque ça.
            # Donc : Pas de contrainte unique simple ici.
        ]

    def __str__(self):
        return f"{self.teacher} -> {self.subject} ({self.classroom})"
