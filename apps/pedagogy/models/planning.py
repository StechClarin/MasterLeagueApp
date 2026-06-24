from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel

class Planning(EstablishmentAwareModel):
    nom = models.CharField(max_length=255)
    date_start = models.DateField(null=True, blank=True)
    date_end = models.DateField(null=True, blank=True)
    is_template = models.BooleanField(default=False)
    
    # Nouveaux champs pour la gestion avancée
    is_global = models.BooleanField(default=False, help_text="Planning récurrent (Emploi du temps de base)")
    is_specific = models.BooleanField(default=False, help_text="Planning ponctuel (Evénement, Semaine d'examens...)")
    is_conge = models.BooleanField(default=False, help_text="Marque cette période comme étant un congé (Annule les cours)")
    
    target_classes = models.ManyToManyField(
        'structure.ClassRoom', 
        blank=True, 
        related_name='targeted_plannings',
        help_text="Classes concernées par ce planning (Laissez vide pour appliquer à tout l'établissement)"
    )

    class Meta:
        verbose_name = "Planning"
        verbose_name_plural = "Plannings"
        ordering = ['-date_start']

    def __str__(self):
        return self.nom
