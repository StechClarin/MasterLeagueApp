import uuid
from django.db import models
from django.conf import settings

class UserAuditModel(models.Model):
    """
    Classe abstraite pour tracer qui a créé et modifié l'objet.
    Utilise UUID comme clé primaire pour la synchronisation Cloud/Local.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    created_by_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_%(class)s_set"
    )
    updated_by_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_%(class)s_set"
    )

    class Meta:
        abstract = True
