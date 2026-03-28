# apps/core/models/module.py
import uuid
from django.db import models

from .user_audit_model import UserAuditModel

class Module(UserAuditModel):
    name = models.CharField(max_length=100)
    order = models.PositiveSmallIntegerField(default=1)
    display_mod = models.CharField(max_length=50, default='list-view', help_text="ex: card-view, list-view")
    icon = models.CharField(max_length=100, blank=True, help_text="Nom de l'icône (ex: pascal-icon-dashboard)")

    class Meta:
        verbose_name = "Module"
        verbose_name_plural = "Modules"
        ordering = ['order', 'name']

    def __str__(self):
        return self.name