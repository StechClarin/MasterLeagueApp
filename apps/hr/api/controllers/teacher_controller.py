from apps.core.api.controllers import BaseController
from ..serializers.teacher_serializer import TeacherSerializer
from ...services.teacher_service import TeacherService

class TeacherController(BaseController):
    def __init__(self):
        super().__init__(TeacherService(), TeacherSerializer)
