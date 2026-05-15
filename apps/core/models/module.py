# apps/core/models/module.py
import uuid
from django.db import models

from .user_audit_model import UserAuditModel

class Module(UserAuditModel):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=100, unique=True, default="", help_text="Code technique unique (ex: mod-finance)")
    order = models.PositiveSmallIntegerField(default=1)
    display_mod = models.CharField(max_length=50, default='list-view', help_text="ex: card-view, list-view")
    icon = models.CharField(max_length=100, blank=True, help_text="Nom de l'icône (ex: pascal-icon-dashboard)")
    is_active = models.BooleanField(default=True, help_text="Définit si le module est débloqué par la licence")

    class Meta:
        verbose_name = "Module"
        verbose_name_plural = "Modules"
        ordering = ['order', 'name']

    def __str__(self):
        return self.name