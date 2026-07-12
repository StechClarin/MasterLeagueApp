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
        # pyrefly: ignore[missing-attribute]
        if str(self.student.establishment_id) != str(self.classroom.establishment_id):
            raise ValidationError("L'élève et la classe doivent appartenir au même établissement.")
            
        # pyrefly: ignore[missing-attribute]
        if self.establishment_id and str(self.establishment_id) != str(self.classroom.establishment_id):
             raise ValidationError("L'inscription doit être liée au même établissement que la classe.")
        
        # Auto-set establishment from classroom if not set (convenience)
        if not self.establishment_id:
            # pyrefly: ignore[missing-attribute]
            self.establishment = self.classroom.establishment

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        
        old_classroom_id = None
        if not is_new:
            old_enrollment = Enrollment.objects.filter(pk=self.pk).first()
            if old_enrollment:
                old_classroom_id = old_enrollment.classroom_id

        self.clean()
        super().save(*args, **kwargs)
        
        from apps.finance.services.finance_service import FinanceService
        if is_new:
            FinanceService.generate_invoices_for_enrollment(self)
        elif old_classroom_id and old_classroom_id != self.classroom_id:
            if self.status == 'PENDING':
                FinanceService.recalculate_invoices_on_class_change(self)
