# apps/core/models/tenant_license.py
from django.db import models
from .establishment import Establishment
from .user_audit_model import UserAuditModel

class TenantLicense(UserAuditModel):
    """
    Modèle de stockage des licences de modules déverrouillés par Tenant (Établissement).
    """
    establishment = models.ForeignKey(
        Establishment,
        on_delete=models.CASCADE,
        related_name="licenses",
        verbose_name="Établissement"
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
        unique_together = ['establishment', 'module_code']
        verbose_name = "Licence Établissement"
        verbose_name_plural = "Licences Établissements"

    def __str__(self):
        return f"{self.establishment.name} -> {self.module_code} ({'Actif' if self.is_active else 'Inactif'})"
