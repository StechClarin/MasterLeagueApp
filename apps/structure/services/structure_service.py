from apps.core.services.BaseService import BaseService
from ..models import AcademicYear, Cycle

class StructureService(BaseService):
    def get_active_structure(self, establishment):
        """
        Retourne la structure active pour un établissement donné.
        """
        if not establishment:
            return None

        active_year = AcademicYear.objects.filter(establishment=establishment, is_active=True).first()
        cycles = Cycle.objects.filter(establishment=establishment).order_by('order')

        # On retourne un objet simple (dict ou classe ad-hoc) que Graphene saura mapper
        return {
            "active_academic_year": active_year,
            "cycles": cycles
        }
