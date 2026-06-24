from django.db import models
from django.conf import settings
from datetime import date
from apps.core.models.establishment_aware_model import EstablishmentAwareModel
from apps.documents.utils import document_upload_path

class Student(EstablishmentAwareModel):
    GENDER_CHOICES = [
        ('M', 'Masculin'),
        ('F', 'Féminin'),
    ]

    matricule = models.CharField(max_length=50, unique=True, blank=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default='M')
    
    date_of_birth = models.DateField(null=True, blank=True)
    place_of_birth = models.CharField(max_length=150, blank=True, null=True)
    
    # Photo with dynamic upload path
    photo = models.ImageField(upload_to=document_upload_path, blank=True, null=True)
    
    address = models.TextField(blank=True, null=True)
    
    # NFC/RFID chip unique identifier for physical badging
    rfid_uid = models.CharField(max_length=50, blank=True, null=True, unique=True, help_text="Identifiant unique de la puce NFC/RFID")
    
    # Optional user account for the student
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='student_profile'
    )

    class Meta:
        verbose_name = "élève"
        verbose_name_plural = "élèves"
        ordering = ['last_name', 'first_name']
        constraints = [
            models.UniqueConstraint(fields=['matricule', 'establishment'], name='unique_matricule_per_establishment')
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.matricule})"

    # Logique métier (matricule) déplacée vers StudentService
