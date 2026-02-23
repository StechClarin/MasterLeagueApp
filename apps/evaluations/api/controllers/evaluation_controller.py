from apps.core.api.controllers.BaseController import BaseController
from ..serializers.evaluation_serializer import EvaluationSerializer
from ...services.evaluation_service import EvaluationService

class EvaluationController(BaseController):
    serializer_class = EvaluationSerializer
    service_class = EvaluationService
