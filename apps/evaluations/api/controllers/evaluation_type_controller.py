from apps.core.api.controllers.BaseController import BaseController
from ..serializers.evaluation_type_serializer import EvaluationTypeSerializer
from ...services.evaluation_type_service import EvaluationTypeService

class EvaluationTypeController(BaseController):
    serializer_class = EvaluationTypeSerializer
    service_class = EvaluationTypeService
