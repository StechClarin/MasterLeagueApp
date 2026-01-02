from apps.core.api.controllers.BaseController import BaseController
from ..serializers.student_serializer import StudentHealthSerializer
from ...services.student_health_service import StudentHealthService

class StudentHealthController(BaseController):
    serializer_class = StudentHealthSerializer
    service_class = StudentHealthService
