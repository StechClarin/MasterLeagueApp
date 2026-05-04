from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel

class Option(EstablishmentAwareModel):
    """
    Représente une spécialité ou filière (ex: Mathématiques, Gestion, Série D).
    Peut être hiérarchique (ex: Informatique > Cyber-sécurité).
    """
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='children',
        verbose_name="Option Parente (Filière)"
    )
    cycle = models.ForeignKey(
        'structure.Cycle',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='options',
        verbose_name="Cycle rattaché"
    )
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=20, null=True, blank=True)

    class Meta:
        verbose_name = "Option"
        verbose_name_plural = "Options"
        ordering = ['name']
        unique_together = ['name', 'parent', 'cycle', 'establishment']

    def __str__(self):
        if self.parent:
            return f"{self.parent.name} - {self.name}"
        return self.name
