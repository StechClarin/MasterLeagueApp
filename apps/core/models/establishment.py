from django.db import models

class Establishment(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True, null=True, blank=True)
    logo = models.ImageField(upload_to='establishments/', null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    phone = models.CharField(max_length=50, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Etablissement"
        verbose_name_plural = "Etablissements"
        ordering = ['name']

    def __str__(self):
        return self.name
