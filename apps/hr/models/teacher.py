from django.db import models
from .personnel import Personnel

class Teacher(Personnel):
    """
    Extension pédagogique du profil employé.
    Hérite de personnel (Multi-table inheritance).
    """
    specialty = models.CharField(max_length=100, blank=True, null=True, verbose_name="Spécialité (ex: Maths)")
    hours_per_week = models.IntegerField(default=0, verbose_name="Volume horaire hebdo")
    
    class Meta:
        verbose_name = "enseignant"
        verbose_name_plural = "enseignants"

    def __str__(self):
        return f"[Prof] {super().__str__()}"
