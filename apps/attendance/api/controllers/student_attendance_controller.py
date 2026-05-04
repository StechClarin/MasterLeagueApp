from apps.core.api.controllers.BaseController import BaseController
from ..serializers.student_attendance_serializer import StudentAttendanceSerializer
from ...services.student_attendance_service import StudentAttendanceService

class StudentAttendanceController(BaseController):
    serializer_class = StudentAttendanceSerializer
    service_class = StudentAttendanceService
