from django.db import models

from apps.core.models.user_audit_model import UserAuditModel

class ContractType(UserAuditModel):
    designation = models.CharField(max_length=150, unique=True, verbose_name="Désignation")
    code = models.CharField(max_length=50, unique=True, verbose_name="Code")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    
    class Meta:
        verbose_name = "type de contrat"
        verbose_name_plural = "types de contrat"
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.designation}"
