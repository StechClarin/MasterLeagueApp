from django.db import models

class ContractType(models.Model):
    designation = models.CharField(max_length=150, unique=True, verbose_name="Désignation")
    code = models.CharField(max_length=50, unique=True, verbose_name="Code")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "type de contrat"
        verbose_name_plural = "types de contrat"
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.designation}"
