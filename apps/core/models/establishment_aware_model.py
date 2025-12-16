from django.db import models
from .establishment import Establishment

class EstablishmentAwareModel(models.Model):
    """
    Classe abstraite pour les modèles qui appartiennent à un établissement.
    """
    establishment = models.ForeignKey(
        Establishment, 
        on_delete=models.CASCADE, 
        related_name="%(class)s_set"
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        abstract = True
