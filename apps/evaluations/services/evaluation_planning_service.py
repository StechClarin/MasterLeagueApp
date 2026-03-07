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
        return super().before_save(data, instance)
