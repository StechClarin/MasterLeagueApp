# apps/profilmanagement/models/user.py
import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from .role import Role
from apps.documents.utils import document_upload_path
from .user_manager import UserManager

from apps.core.models.user_audit_model import UserAuditModel

class User(UserAuditModel, AbstractBaseUser, PermissionsMixin):
    # ... (Champs standards inchangés : username, email, etc.) ...
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    phone = models.CharField(max_length=50, blank=True, null=True, verbose_name="Téléphone")

    photo = models.ImageField(upload_to=document_upload_path, blank=True, null=True)

    # --- CHANGEMENT ICI ---
    # On passe en ManyToMany. Plus de on_delete, car c'est une table de liaison.
    roles = models.ManyToManyField(
        Role,
        blank=True,
        verbose_name="Rôles",
        related_name="users"
    )

    establishment = models.ForeignKey(
        'core.Establishment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users',
        verbose_name="Établissement"
    )

    objects = UserManager()

    EMAIL_FIELD = 'email'
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"

    def __str__(self):
        return self.username

    groups = None
    user_permissions = None