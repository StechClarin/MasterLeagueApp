from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel
from .cycle import Cycle

class Level(EstablishmentAwareModel):
    cycle = models.ForeignKey(Cycle, on_delete=models.CASCADE, related_name='levels')
    name = models.CharField(max_length=100)
    short_name = models.CharField(max_length=50, null=True, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Niveau"
        verbose_name_plural = "Niveaux"
        ordering = ['order', 'name']
        unique_together = ['name', 'cycle'] # Unique par cycle

    def __str__(self):
        return self.name
