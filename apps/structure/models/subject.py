from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel

class Subject(EstablishmentAwareModel):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50)

    class Meta:
        verbose_name = "Matière"
        verbose_name_plural = "Matières"
        ordering = ['name']
        unique_together = ['code', 'establishment']

    def __str__(self):
        return f"{self.name} ({self.code})"
