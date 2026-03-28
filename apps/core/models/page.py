# apps/core/models/page.py
import uuid
from django.db import models
from .module import Module # On importe notre modèle Module

from .user_audit_model import UserAuditModel

class Page(UserAuditModel):
    title = models.CharField(max_length=100)
    icon = models.CharField(max_length=100, blank=True, help_text="Nom de l'icône (ex: client-icon)")
    order = models.PositiveSmallIntegerField(default=1)
    link = models.CharField(max_length=255, help_text="Lien React (ex: /clients)")
    
    # Lien vers le Module parent
    module = models.ForeignKey(
        Module,
        related_name="pages", # Important pour la sérialisation
        on_delete=models.CASCADE
    )
    
    # Tes "tags" de permissions
    permission_tags = models.JSONField(
        default=list,
        blank=True,
        help_text="Liste des tags de permission (ex: [\"client\"])"
    )

    class Meta:
        verbose_name = "Page"
        verbose_name_plural = "Pages"
        ordering = ['module', 'order', 'title']

    def __str__(self):
        return f"{self.module.name} > {self.title}"