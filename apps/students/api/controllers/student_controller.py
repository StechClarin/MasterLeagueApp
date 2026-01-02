from apps.core.api.controllers.BaseController import BaseController
from ..serializers.student_serializer import StudentSerializer
from ...services.student_service import StudentService

class StudentController(BaseController):
    serializer_class = StudentSerializer
    service_class = StudentService
