from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel
from .level import Level
from .subject import Subject

class LevelSubject(EstablishmentAwareModel):
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='level_subjects')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='level_subjects')
    coefficient = models.DecimalField(max_digits=5, decimal_places=2, default=1.0)
    hourly_quota = models.PositiveIntegerField(default=0, help_text="Volume horaire annuel")

    class Meta:
        verbose_name = "Matière par Niveau"
        verbose_name_plural = "Matières par Niveau"
        unique_together = ['level', 'subject']
        ordering = ['level', 'subject']

    def __str__(self):
        return f"{self.level.name} - {self.subject.name}"
