from apps.core.api.controllers.BaseController import BaseController
from ..serializers.grade_serializer import GradeSerializer
from ...services.grade_service import GradeService

class GradeController(BaseController):
    serializer_class = GradeSerializer
    service_class = GradeService
