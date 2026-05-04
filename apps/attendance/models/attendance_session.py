from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel

class AttendanceSession(EstablishmentAwareModel):
    classroom = models.ForeignKey('structure.ClassRoom', on_delete=models.CASCADE, related_name='attendance_sessions')
    date = models.DateField()
    period_name = models.CharField(max_length=50)
    planning = models.ForeignKey('pedagogy.Planning', on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        unique_together = ['classroom', 'date', 'period_name', 'establishment']
