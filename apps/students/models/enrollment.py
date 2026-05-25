from django.db import models
from django.core.exceptions import ValidationError
from django.db.models import signals
from django.dispatch import receiver
from apps.core.models.establishment_aware_model import EstablishmentAwareModel
from .student import Student

class Enrollment(EstablishmentAwareModel):
    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('REGISTERED', 'Inscrit'),
        ('LEFT', 'Parti'),
        ('EXPELLED', 'Renvoyé'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrollments')
    # We import models inside methods or use string reference to avoid circular imports if needed, 
    # but ClassRoom and AcademicYear are in other apps, so direct import is safer if apps are loaded
    classroom = models.ForeignKey('structure.ClassRoom', on_delete=models.PROTECT, related_name='enrollments')
    academic_year = models.ForeignKey('structure.AcademicYear', on_delete=models.PROTECT, related_name='enrollments')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    enrollment_date = models.DateField(auto_now_add=True)
    is_repeater = models.BooleanField(default=False)

    class Meta:
        verbose_name = "inscription"
        verbose_name_plural = "inscriptions"
        unique_together = ['student', 'academic_year']

    def __str__(self):
        return f"{self.student} - {self.classroom} ({self.academic_year})"

    def clean(self):
        # Validation Cross-Establishment
        if self.student.establishment_id != self.classroom.establishment_id:
            raise ValidationError("L'élève et la classe doivent appartenir au même établissement.")
            
        if self.establishment_id and self.establishment_id != self.classroom.establishment_id:
             raise ValidationError("L'inscription doit être liée au même établissement que la classe.")
        
        # Auto-set establishment from classroom if not set (convenience)
        if not self.establishment_id:
            self.establishment = self.classroom.establishment

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        self.clean()
        super().save(*args, **kwargs)
        
        if is_new:
            from apps.finance.services.finance_service import FinanceService
            FinanceService.generate_invoices_for_enrollment(self)
