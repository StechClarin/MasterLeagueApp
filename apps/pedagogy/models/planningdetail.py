from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel

class PlanningDetail(EstablishmentAwareModel):
    planning = models.ForeignKey(
        'pedagogy.Planning', 
        on_delete=models.CASCADE, 
        related_name='details'
    )
    classe = models.ForeignKey(
        'structure.ClassRoom', 
        on_delete=models.CASCADE, 
        related_name='planning_details'
    )
    matiere = models.ForeignKey(
        'structure.Subject', 
        on_delete=models.CASCADE, 
        related_name='planning_details'
    )
    enseignant = models.ForeignKey(
        'hr.Personnel', 
        on_delete=models.CASCADE, 
        related_name='planning_details'
    )
    salle = models.ForeignKey(
        'structure.Room', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='planning_details'
    )
    
    date = models.DateField()
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    
    # Gestion des annulations (Exception de planning)
    is_cancelled = models.BooleanField(default=False, help_text="Marque ce cours spécifique comme annulé (utile pour les absences)")
    rescheduled_to = models.DateField(null=True, blank=True, help_text="Date à laquelle le cours a été reporté")

    class Meta:
        verbose_name = "Détail du Planning"
        verbose_name_plural = "Détails du Planning"
        ordering = ['date', 'heure_debut']

    def __str__(self):
        return f"{self.date} {self.heure_debut}-{self.heure_fin}: {self.matiere} ({self.classe})"
