from apps.core.services.BaseService import BaseService
from ..models import Evaluation

class EvaluationService(BaseService):
    model = Evaluation
