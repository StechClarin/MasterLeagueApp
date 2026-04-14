from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from ..utils import document_upload_path
from apps.core.models.establishment_aware_model import EstablishmentAwareModel

class Document(EstablishmentAwareModel):
    TYPE_CHOICES = [
        ('CV', 'CV'),
        ('CONTRAT', 'Contrat de Travail'),
        ('PHOTO', 'Photo d\'identité'),
        ('DIPLOME', 'Diplôme'),
        ('JUSTIFICATIF', 'Justificatif'),
        ('AUTRE', 'Autre'),
    ]

    title = models.CharField(max_length=255, blank=True)
    file = models.FileField(upload_to=document_upload_path)
    document_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='AUTRE')
    
    # Generic Relation fields
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Document"
        verbose_name_plural = "Documents"
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.get_document_type_display()} - {self.title or self.file.name}"
