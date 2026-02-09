from apps.core.services.BaseService import BaseService
from ..models.academic_year import AcademicYear

class AcademicYearService(BaseService):
    model = AcademicYear

    def save_process(self, data, instance=None):
        # 1. Vérification de la logique "Active"
        is_active = data.get('is_active', False)
        establishment = data.get('establishment') or data.get('establishment_id') 
        
        # Si on est en modification, on récupère l'établissement de l'instance si pas dans data
        if instance and not establishment:
            establishment = instance.establishment

        # Si cette année devient active, on désactive les autres de ce même établissement
        if is_active and establishment:
            print(f"DEBUG: Activating AcademicYear for Establishment: {establishment} (ID: {getattr(establishment, 'id', establishment)})")
            updated_count = AcademicYear.objects.filter(
                establishment=establishment, 
                is_active=True
            ).exclude(pk=instance.pk if instance else None).update(is_active=False)
            print(f"DEBUG: Deactivated {updated_count} other years for this establishment.")

        # 2. Sauvegarde standard
        return super().save_process(data, instance)
