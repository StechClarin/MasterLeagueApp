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

    # --- Identité & Légal ---
    slogan = models.CharField(max_length=255, null=True, blank=True)
    website = models.URLField(null=True, blank=True)
    tax_id = models.CharField(max_length=100, null=True, blank=True, verbose_name="NIF / Matricule")
    
    # --- Localisation ---
    city = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True, default="Cameroun")

    # --- Branding (Impression) ---
    print_header = models.ImageField(upload_to='establishments/headers/', null=True, blank=True)
    print_footer = models.TextField(null=True, blank=True, help_text="Texte légal en bas de page")

    class Meta:
        verbose_name = "Etablissement"
        verbose_name_plural = "Etablissements"
        ordering = ['name']
        unique_together = ['name', 'city']

    def __str__(self):
        return self.name
