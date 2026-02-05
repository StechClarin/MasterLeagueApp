from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel

class Planning(EstablishmentAwareModel):
    nom = models.CharField(max_length=255)
    date_start = models.DateField(null=True, blank=True)
    date_end = models.DateField(null=True, blank=True)
    is_template = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Planning"
        verbose_name_plural = "Plannings"
        ordering = ['-date_start']

    def __str__(self):
        return self.nom
