from django.db import models
from django.conf import settings
from apps.core.models.establishment_aware_model import EstablishmentAwareModel
from .level import Level
from .academic_year import AcademicYear

class ClassRoom(EstablishmentAwareModel):
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='classrooms')
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='classrooms')
    main_teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='main_classrooms'
    )
    name = models.CharField(max_length=100)
    capacity = models.PositiveIntegerField(default=35)

    class Meta:
        verbose_name = "Classe"
        verbose_name_plural = "Classes"
        ordering = ['name']
        unique_together = ['name', 'level', 'academic_year']

    def __str__(self):
        return f"{self.name} ({self.academic_year.name})"
