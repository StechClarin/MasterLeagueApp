from apps.core.services.BaseService import BaseService
from ..models import EvaluationSupervision

class EvaluationSupervisionService(BaseService):
    model = EvaluationSupervision

    def before_save(self, data, instance=None):
        # Convertir room (string/UUID) → room_id (FK) comme envoie le frontend/le save imbriqué.
        # Sans cela : "Cannot assign '<uuid>': EvaluationSupervision.room must be a Room instance."
        if 'room' in data and not hasattr(data['room'], '_meta'):
            data['room_id'] = data.pop('room')
        return super().before_save(data, instance)

