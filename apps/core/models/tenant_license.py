# apps/core/models/tenant_license.py
from django.db import models
from django.conf import settings
from .user_audit_model import UserAuditModel

class TenantLicense(UserAuditModel):
    """
    Modèle de stockage des licences de modules déverrouillés par Propriétaire (Tenant / User).
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="licenses",
        verbose_name="Propriétaire (Owner)",
        null=True,
        blank=True
    )
    module_code = models.CharField(
        max_length=100,
        help_text="Code technique unique du module (ex: mod-finance)",
        verbose_name="Code du Module"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Définit si le module est débloqué par la licence",
        verbose_name="Est Actif"
    )

    class Meta:
        unique_together = ['user', 'module_code']
        verbose_name = "Licence Tenant"
        verbose_name_plural = "Licences Tenants"

    def __str__(self):
        return f"{self.user.username} (Hub: {self.user.hub_id}) -> {self.module_code} ({'Actif' if self.is_active else 'Inactif'})"
