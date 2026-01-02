from django.db import models
from django.conf import settings
from datetime import date
from apps.core.models.establishment_aware_model import EstablishmentAwareModel

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
    
    # Photo with dynamic upload path (apps/students because it's the app name, logically)
    photo = models.ImageField(upload_to='students/photos/', blank=True, null=True)
    
    address = models.TextField(blank=True, null=True)
    
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

    def save(self, *args, **kwargs):
        if not self.matricule:
            self.matricule = self.generate_matricule()
        super().save(*args, **kwargs)

    def generate_matricule(self):
        # Format: {YY}-{INITIALS}-{SEQ}
        # YY: 2 last digits of current year (or establishment year?) -> logic: current year simple
        # INITIALS: 2 Chars from Establishment Name or fixed? -> taking from Establishment if avail, else 'ET'
        # SEQ: Auto-increment
        
        year_suffix = date.today().strftime('%y')
        
        est_code = "ET"
        if self.establishment and self.establishment.name:
            est_code = self.establishment.name[:2].upper()
            
        # Try to find last matricule for this pattern
        # Optimistic concurrency: simple count + 1 for now (production would require Sequence table or redis)
        pattern = f"{year_suffix}-{est_code}-"
        
        last_student = Student.objects.filter(
            matricule__startswith=pattern,
            establishment=self.establishment
        ).order_by('-matricule').first()
        
        seq = 1
        if last_student and last_student.matricule:
            try:
                parts = last_student.matricule.split('-')
                if len(parts) == 3:
                     seq = int(parts[2]) + 1
            except ValueError:
                pass # Fallback to 1
        
        return f"{year_suffix}-{est_code}-{seq:04d}"
