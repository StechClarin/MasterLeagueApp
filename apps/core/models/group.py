import uuid
from django.db import models
from .permission import Permission # On importe notre Permission custom
from .user_audit_model import UserAuditModel

class Group(UserAuditModel):
    name = models.CharField(max_length=150, blank=True)
    permissions = models.ManyToManyField(
        Permission,
        blank=True,
        verbose_name="Permissions"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "group"
        verbose_name_plural = "groups"
        ordering = ['-created_at']

    def __str__(self):
        return self.name or f"Group #{self.pk}"
