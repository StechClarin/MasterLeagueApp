from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel

class Room(EstablishmentAwareModel):
    ROOM_TYPE_CHOICES = [
        ('CLASSROOM', 'Salle de classe'),
        ('OFFICE', 'Bureau'),
        ('LABORATORY', 'Laboratoire'),
        ('LIBRARY', 'Bibliothèque'),
        ('STORAGE', 'Autre / Stockage'),
    ]

    name = models.CharField(max_length=100)
    capacity = models.PositiveIntegerField(default=30, null=True, blank=True)
    room_type = models.CharField(max_length=50, choices=ROOM_TYPE_CHOICES, default='CLASSROOM', verbose_name="Type de local")

    class Meta:
        verbose_name = "Salle"
        verbose_name_plural = "Salles"
        ordering = ['name']

    def __str__(self):
        return self.name
