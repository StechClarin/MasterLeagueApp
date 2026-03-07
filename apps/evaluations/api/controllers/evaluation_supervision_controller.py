from apps.core.api.controllers.BaseController import BaseController
from ..serializers.evaluation_serializer import EvaluationSupervisionSerializer
from ...services import EvaluationSupervisionService


class EvaluationSupervisionController(BaseController):
    serializer_class = EvaluationSupervisionSerializer
    service_class = EvaluationSupervisionService
