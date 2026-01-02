from apps.core.api.controllers.BaseController import BaseController
from ..serializers.enrollment_serializer import EnrollmentSerializer
from ...services.enrollment_service import EnrollmentService

class EnrollmentController(BaseController):
    serializer_class = EnrollmentSerializer
    service_class = EnrollmentService
