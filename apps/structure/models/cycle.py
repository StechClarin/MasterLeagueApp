from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel

class Cycle(EstablishmentAwareModel):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, null=True, blank=True, verbose_name="Code du cycle")
    description = models.TextField(null=True, blank=True, verbose_name="Description")
    has_options = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Cycle"
        verbose_name_plural = "Cycles"
        ordering = ['order', 'name']
        unique_together = [('name', 'establishment'), ('code', 'establishment'), ('order', 'establishment')]

    def __str__(self):
        return self.name
