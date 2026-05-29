from apps.core.services.BaseService import BaseService
from ..models import EvaluationPlanning

class EvaluationPlanningService(BaseService):
    model = EvaluationPlanning

    def before_save(self, data, instance=None):
        """
        Map frontend field names to model field names for M2M.
        """
        if 'levels_ids' in data:
            data['levels'] = data.pop('levels_ids')
        if 'classrooms_ids' in data:
            data['classrooms'] = data.pop('classrooms_ids')
        if 'rooms_ids' in data:
            data['rooms'] = data.pop('rooms_ids')
            
        # Automatically populate levels from classrooms if classrooms are present
        classroom_ids = data.get('classrooms', [])
        if classroom_ids:
            from apps.structure.models import ClassRoom
            level_ids = list(ClassRoom.objects.filter(id__in=classroom_ids).values_list('level_id', flat=True).distinct())
            data['levels'] = level_ids
            
        return super().before_save(data, instance)
