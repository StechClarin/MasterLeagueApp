from django.db import models
from apps.structure.models.academic_year import AcademicYear
from apps.structure.models.cycle import Cycle

from apps.core.models.user_audit_model import UserAuditModel

class AcademicCycleConfig(UserAuditModel):
    """
    Configuration spécifique pour un Cycle durant une Année Scolaire donné.
    Permet de définir une date de rentrée spécifique (ex: Prepa rentre avant Lycée).
    """
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='cycle_configs')
    cycle = models.ForeignKey(Cycle, on_delete=models.CASCADE, related_name='academic_configs')
    
    start_date = models.DateField(
        null=True, blank=True, 
        help_text="Date de rentrée spécifique pour ce cycle. Si vide, utilise la date de l'année."
    )

    class Meta:
        verbose_name = "Configuration Cycle/Année"
        verbose_name_plural = "Configurations Cycle/Année"
        unique_together = ['academic_year', 'cycle']
    
    def __str__(self):
        return f"Config {self.cycle.name} - {self.academic_year.name}"
