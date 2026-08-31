from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel
from .asset import Asset

class InterventionRequest(EstablishmentAwareModel):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name="interventions")
    description = models.TextField(verbose_name="Description de la panne / anomalie")
    reported_at = models.DateTimeField(auto_now_add=True, verbose_name="Signalé le")
    resolved_at = models.DateTimeField(blank=True, null=True, verbose_name="Résolu le")

    class Meta:
        verbose_name = "Demande d'intervention"
        verbose_name_plural = "Demandes d'intervention"
        ordering = ['-reported_at']

    def __str__(self):
        return f"Intervention sur {self.asset.name} - {self.reported_at.strftime('%d/%m/%Y')}"
