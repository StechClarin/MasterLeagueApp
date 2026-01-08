from apps.core.api.controllers.BaseController import BaseController
from ..serializers.teacher_serializer import TeacherSerializer
from ...services.teacher_service import TeacherService

class TeacherController(BaseController):
    serializer_class = TeacherSerializer
    service_class = TeacherService
