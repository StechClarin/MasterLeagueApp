from django.db import models
from django.conf import settings
from apps.core.models.establishment_aware_model import EstablishmentAwareModel

class Guardian(EstablishmentAwareModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='guardian_profile',
        null=True, blank=True # Le compte user peut être créé plus tard
    )
    
    # On utilise le téléphone comme clé de recherche principale (Business Key)
    phone_number = models.CharField(max_length=50, unique=True, default="0000") 
    profession = models.CharField(max_length=150, blank=True, null=True)
    
    # Champs pour stocker le nom si pas de User lié
    first_name = models.CharField(max_length=150, blank=True, null=True)
    last_name = models.CharField(max_length=150, blank=True, null=True)
    
    role = models.CharField(max_length=20, choices=[('FATHER', 'Père'), ('MOTHER', 'Mère'), ('TUTOR', 'Tuteur')], default='TUTOR')
    is_legal_guardian = models.BooleanField(default=False)

    
    # Relation M2M simple
    students = models.ManyToManyField('Student', related_name='guardians', blank=True)

    class Meta:
        verbose_name = "tuteur"
        verbose_name_plural = "tuteurs"

    def __str__(self):
        # Fallback si pas de User lié
        if self.user:
            return f"{self.user.first_name} {self.user.last_name}"
        if self.first_name or self.last_name:
            return f"{self.first_name} {self.last_name} ({self.phone_number})"
        return f"Tuteur {self.phone_number}"