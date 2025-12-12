from django.db import models

class Voiture(models.Model):
    name = models.CharField(max_length=150, blank=True, verbose_name="Nom")
    couleur = models.CharField(max_length=50, blank=True, verbose_name="Couleur")
    matricule = models.CharField(max_length=20, unique=True, verbose_name="Matricule")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "voiture"
        verbose_name_plural = "voitures"
        ordering = ['-created_at']

    def __str__(self):
        return self.name or f"Voiture #{self.pk}"
