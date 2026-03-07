from apps.core.api.controllers.BaseController import BaseController
from ..serializers.evaluation_serializer import EvaluationPlanningSerializer
from ...services import EvaluationPlanningService


class EvaluationPlanningController(BaseController):
    serializer_class = EvaluationPlanningSerializer
    service_class = EvaluationPlanningService
