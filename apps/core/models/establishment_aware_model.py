from django.db import models
from .establishment import Establishment
from .user_audit_model import UserAuditModel

class EstablishmentAwareModel(UserAuditModel):
    """
    Classe abstraite pour les modèles qui appartiennent à un établissement.
    """
    establishment = models.ForeignKey(
        Establishment, 
        on_delete=models.CASCADE, 
        related_name="%(class)s_set"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        abstract = True
