from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel

class AcademicYear(EstablishmentAwareModel):
    name = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField()
    is_archived = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False, help_text="L'année en cours")

    class Meta:
        verbose_name = "Année Académique"
        verbose_name_plural = "Années Académiques"
        unique_together = ['name', 'establishment']
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.name} ({self.establishment.name})"
