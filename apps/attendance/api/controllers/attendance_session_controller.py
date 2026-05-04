from apps.core.api.controllers.BaseController import BaseController
from ..serializers.attendance_session_serializer import AttendanceSessionSerializer
from ...services.attendance_session_service import AttendanceSessionService

class AttendanceSessionController(BaseController):
    serializer_class = AttendanceSessionSerializer
    service_class = AttendanceSessionService
