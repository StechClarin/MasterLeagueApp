from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel

class SubjectGroup(EstablishmentAwareModel):
    name = models.CharField(max_length=150, blank=False)
    
    class Meta:
        verbose_name = "Groupe de Matières"
        verbose_name_plural = "Groupes de Matières"
        ordering = ['name']

    def __str__(self):
        return self.name or f"SubjectGroup #{self.pk}"

