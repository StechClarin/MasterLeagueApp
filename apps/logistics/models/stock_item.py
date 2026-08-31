from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel

class StockItem(EstablishmentAwareModel):
    name = models.CharField(max_length=150, verbose_name="Nom de l'article")
    quantity = models.IntegerField(default=0, verbose_name="Quantité en stock")
    min_threshold = models.IntegerField(default=5, verbose_name="Seuil minimum d'alerte")
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Coût unitaire")

    class Meta:
        verbose_name = "Article de stock / Consommable"
        verbose_name_plural = "Articles de stock & Consommables"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} (Qté: {self.quantity})"
