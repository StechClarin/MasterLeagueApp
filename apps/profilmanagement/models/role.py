# apps/profilmanagement/models/role.py
from django.db import models
from apps.core.models.group import Group  # On importe notre Group custom
from apps.core.models.permission import Permission # Import Permission

class Role(models.Model):
    name = models.CharField(max_length=150, unique=True, verbose_name="Nom du rôle")
    groups = models.ManyToManyField(
        Group,
        blank=True,
        verbose_name="Groupes de permission",
        related_name="roles"
    )
    
    # --- AJOUT: Permissions directes ---
    permissions = models.ManyToManyField(
        Permission,
        blank=True,
        verbose_name="Permissions Explicites",
        related_name="roles"
    )

    class Meta:
        verbose_name = "Rôle"
        verbose_name_plural = "Rôles"

    def __str__(self):
        return self.name