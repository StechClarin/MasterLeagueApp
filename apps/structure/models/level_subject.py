from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel
from .level import Level
from .subject import Subject
from .option import Option
from .subject_group import SubjectGroup

class LevelSubject(EstablishmentAwareModel):
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='level_subjects')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='level_subjects')
    option = models.ForeignKey(Option, on_delete=models.CASCADE, null=True, blank=True, related_name='level_subjects')
    coefficient = models.DecimalField(max_digits=5, decimal_places=2, default=1.0)
    hourly_quota = models.PositiveIntegerField(default=0, help_text="Volume horaire annuel")
    group = models.ForeignKey(SubjectGroup, on_delete=models.SET_NULL, null=True, blank=True, related_name='level_subjects')
    credits = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, default=0.0)
    is_optional = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Matière par Niveau"
        verbose_name_plural = "Matières par Niveau"
        unique_together = ['level', 'subject', 'option']
        ordering = ['level', 'subject']

    def __str__(self):
        option_name = f" [{self.option.name}]" if self.option else ""
        return f"{self.level.name}{option_name} - {self.subject.name}"
