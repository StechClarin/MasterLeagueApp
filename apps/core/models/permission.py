# apps/profilmanagement/models/permission.py
import uuid
from django.db import models

from .user_audit_model import UserAuditModel

class Permission(UserAuditModel):
    name = models.CharField(max_length=255, verbose_name="Nom (ex: Lire les examens)")
    codename = models.CharField(max_length=100, unique=True, verbose_name="Codename (ex: view_examen)")
    tag = models.CharField(max_length=100, verbose_name="Tag (ex: examen)")

    class Meta:
        verbose_name = "Permission"
        verbose_name_plural = "Permissions"
        ordering = ['tag', 'name']

    def __str__(self):
        return self.name