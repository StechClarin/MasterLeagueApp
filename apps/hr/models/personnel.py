from django.db import models
from django.conf import settings
from apps.core.models.establishment_aware_model import EstablishmentAwareModel
from apps.profilmanagement.models.role import Role
from .contract_type import ContractType

class Personnel(EstablishmentAwareModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='employments',
        null=True, blank=True
    )
    roles = models.ManyToManyField(
        Role,
        related_name='personnels',
        verbose_name="Rôles dans l'établissement",
        blank=True
    )
    GENDER_CHOICES = [
        ('M', 'Masculin'),
        ('F', 'Féminin'),
    ]

    matricule = models.CharField(max_length=50, blank=True) # Unique per establishment via Constraint
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default='M', verbose_name="Genre")
    
    job_title = models.CharField(max_length=150, verbose_name="Intitulé du poste")
    
    contract_type = models.ForeignKey(
        ContractType,
        on_delete=models.SET_NULL,
        null=True,
        related_name='personnels',
        verbose_name="Type de contrat"
    )
    
    phone_number = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    email_pro = models.EmailField(blank=True, null=True, verbose_name="Email Professionnel")
    
    date_hired = models.DateField(null=True, blank=True, verbose_name="Date d'embauche")
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "personnel"
        verbose_name_plural = "personnels"
        constraints = [
            models.UniqueConstraint(fields=['user', 'establishment'], name='unique_personnel_per_establishment'),
            models.UniqueConstraint(fields=['matricule', 'establishment'], name='unique_personnel_matricule_per_establishment')
        ]

    # Logique métier (matricule) déplacée vers PersonnelService
    
    def __str__(self):
        if self.user:
            name = f"{self.user.first_name} {self.user.last_name}".strip()
            if not name:
                name = self.user.email
        else:
            name = "En attente de liaison"
        return f"{name} - {self.job_title} ({self.establishment.name})"
