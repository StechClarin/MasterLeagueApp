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
    matricule = models.CharField(max_length=50, blank=True) # Unique per establishment via Constraint
    
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

    # save() logic moved to PersonnelService.before_save()
    
    def __str__(self):
        name = self.user.get_full_name() if self.user else "En attente de liaison"
        return f"{name} - {self.job_title} ({self.establishment.name})"
