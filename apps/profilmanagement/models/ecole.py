from django.db import models

class Ecole(models.Model):
    nom = models.CharField(max_length=255)
    adresse = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Ecole"
        verbose_name_plural = "Ecoles"
        ordering = ['-created_at']

    def __str__(self):
        return self.nom
