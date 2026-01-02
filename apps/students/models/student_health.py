from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel
from .student import Student

class StudentHealth(EstablishmentAwareModel):
    BLOOD_GROUPS = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    ]

    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='health')
    
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUPS, blank=True, null=True)
    height_cm = models.IntegerField(blank=True, null=True)
    weight_kg = models.IntegerField(blank=True, null=True)
    
    allergies = models.TextField(blank=True, null=True, help_text="Liste des allergies connues")
    medical_conditions = models.TextField(blank=True, null=True, help_text="Conditions médicales chroniques")
    
    emergency_contact_name = models.CharField(max_length=150, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        verbose_name = "santé élève"
        verbose_name_plural = "santé élèves"

    def __str__(self):
        return f"Santé de {self.student}"
