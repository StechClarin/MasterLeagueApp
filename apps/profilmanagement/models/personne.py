from django.db import models

class Personne(models.Model):
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    age = models.IntegerField()
    nationalite = models.CharField(max_length=100, verbose_name="Nationalité")
    genre = models.CharField(max_length=20, choices=[('M', 'Masculin'), ('F', 'Féminin'), ('O', 'Autre')])
    taille = models.DecimalField(max_digits=5, decimal_places=2, help_text="Taille en mètres")
    poid = models.DecimalField(max_digits=5, decimal_places=2, help_text="Poids en kg")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "personne"
        verbose_name_plural = "personnes"
        ordering = ['nom', 'prenom']

    def __str__(self):
        return f"{self.nom} {self.prenom}"
