from django.db import models

class Evenement(models.Model):
    # Champs standards
    nom = models.CharField(max_length=255, verbose_name="Nom de l'événement")
    lieu = models.CharField(max_length=255, verbose_name="Lieu")
    date_debut = models.DateTimeField(verbose_name="Date de début")
    date_fin = models.DateTimeField(verbose_name="Date de fin")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    deleted_at = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Evénement"
        verbose_name_plural = "Evénements"

    def __str__(self):
        return f"{self.nom} #{self.pk}"
