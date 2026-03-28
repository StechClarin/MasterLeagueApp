from django.db import models
from apps.hr.models.personnel import Personnel as Personne

from apps.core.models.user_audit_model import UserAuditModel

class Contact(UserAuditModel):
    personne = models.ForeignKey(Personne, on_delete=models.CASCADE, related_name='contacts')
    telephone = models.CharField(max_length=20)
    email = models.EmailField()
    adresse = models.TextField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "contact"
        verbose_name_plural = "contacts"

    def __str__(self):
        return f"Contact de {self.personne}"
