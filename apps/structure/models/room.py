from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel

class Room(EstablishmentAwareModel):
    name = models.CharField(max_length=100)
    capacity = models.PositiveIntegerField(default=30, null=True, blank=True)
    
    class Meta:
        verbose_name = "Salle"
        verbose_name_plural = "Salles"
        ordering = ['name']

    def __str__(self):
        return self.name
