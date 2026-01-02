from django.db import models
from django.conf import settings
from apps.core.models.establishment_aware_model import EstablishmentAwareModel
from apps.profilmanagement.models.role import Role
from django.contrib.auth import get_user_model

class Personnel(EstablishmentAwareModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='employments',
        null=True, blank=True
    )
    role = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,
        null=True,
        related_name='personnel',
        verbose_name="Rôle dans l'établissement"
    )
    matricule = models.CharField(max_length=50) # Unique per establishment via Constraint
    
    job_title = models.CharField(max_length=150, verbose_name="Intitulé du poste")
    contract_type = models.CharField(
        max_length=50, 
        choices=[('CDI', 'CDI'), ('CDD', 'CDD'), ('VACATAIRE', 'Vacataire'), ('INTERIM', 'Intérim'), ('STAGE', 'Stage')],
        default='CDI'
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

    def save(self, *args, **kwargs):
        # Auto-provisioning User if needed
        if not self.user and self.email_pro:
            User = get_user_model()
            # Check if user exists by email
            existing_user = User.objects.filter(email=self.email_pro).first()
            if existing_user:
                self.user = existing_user
            else:
                # Create new user
                # Username = email part or generated
                username = self.email_pro.split('@')[0]
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1
                
                new_user = User.objects.create_user(
                    username=username,
                    email=self.email_pro,
                    password="ChangeMe123!" # Default password
                    # establishment is purposely NOT set here as per new architecture
                )
                self.user = new_user
        
        super().save(*args, **kwargs)

    def __str__(self):
        name = self.user.get_full_name() if self.user else "En attente de liaison"
        return f"{name} - {self.job_title} ({self.establishment.name})"
