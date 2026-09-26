# apps/core/models/tenant_quota.py
from django.db import models
from django.conf import settings
from .user_audit_model import UserAuditModel

class TenantQuota(UserAuditModel):
    """
    Gestion des quotas de licences Utilisateurs (Personnel / Staff) et Élèves pour un Owner.
    Les élèves qui se connectent via Magic Link sur eteyelo.online NE CONSOMMENT PAS le quota max_users.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="quota",
        verbose_name="Propriétaire (Owner)"
    )
    max_users = models.IntegerField(
        default=5,
        help_text="Nombre maximum d'utilisateurs actifs du personnel (Staff/Professeurs/Admins) autorisés",
        verbose_name="Quota Max Utilisateurs Personnel"
    )
    max_students = models.IntegerField(
        default=500,
        help_text="Quota d'élèves autorisés dans le parc de l'établissement",
        verbose_name="Quota Max Élèves"
    )

    class Meta:
        verbose_name = "Quota Tenant"
        verbose_name_plural = "Quotas Tenants"

    def __str__(self):
        username = getattr(self.user, 'username', 'N/A') if self.user else "N/A"
        return f"Quota {username}: {self.current_staff_users_count()}/{self.max_users} Personnel(s)"

    def current_staff_users_count(self):
        """
        Compte uniquement les membres du personnel / enseignants actifs rattachés aux établissements de cet owner.
        Les élèves via Magic Link ne sont PAS comptabilisés.
        """
        from apps.hr.models import Personnel
        return Personnel.objects.filter(
            establishment__user=self.user,
            is_active=True,
            is_deleted=False
        ).values('user_id').distinct().count()

    def can_add_staff(self):
        """Vérifie si le quota d'utilisateurs personnel permet d'en ajouter un nouveau."""
        return self.current_staff_users_count() < self.max_users
