from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel
from .asset import Asset

class MaintenanceRecord(EstablishmentAwareModel):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name="maintenances")
    description = models.TextField(verbose_name="Description des opérations de maintenance")
    performed_at = models.DateTimeField(auto_now_add=True, verbose_name="Effectué le")

    class Meta:
        verbose_name = "Rapport de maintenance"
        verbose_name_plural = "Rapports de maintenance"
        ordering = ['-performed_at']

    def __str__(self):
        return f"Maintenance de {self.asset.name} - {self.performed_at.strftime('%d/%m/%Y')}"
