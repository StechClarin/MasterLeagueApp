# apps/core/models/establishment_membership.py
from django.db import models
from django.conf import settings
from .user_audit_model import UserAuditModel
from apps.profilmanagement.models.role import Role

class EstablishmentMembership(UserAuditModel):
    """
    Modèle de jonction entre un utilisateur et un établissement.
    Définit les rôles contextuels de l'utilisateur dans cet établissement.
    """
    STATUS_CHOICES = [
        ('active', 'Actif'),
        ('inactive', 'Inactif'),
        ('invited', 'Invité'),
        ('revoked', 'Révoqué'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='memberships',
        verbose_name="Utilisateur"
    )
    establishment = models.ForeignKey(
        'core.Establishment',
        on_delete=models.CASCADE,
        related_name='memberships',
        verbose_name="Établissement"
    )
    roles = models.ManyToManyField(
        Role,
        blank=True,
        related_name='memberships',
        verbose_name="Rôles contextuels"
    )
    
    is_owner = models.BooleanField(
        default=False, 
        verbose_name="Est le propriétaire",
        help_text="Le propriétaire a tous les droits sur l'établissement"
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        verbose_name="Statut"
    )

    class Meta:
        verbose_name = "Membre de l'établissement"
        verbose_name_plural = "Membres des établissements"
        # Un utilisateur ne peut avoir qu'un seul membership par établissement
        unique_together = ['user', 'establishment']

    def __str__(self):
        return f"{self.user.username} @ {self.establishment.name}"
