from apps.core.api.controllers.BaseController import BaseController
from ..serializers.staff_attendance_serializer import StaffAttendanceSerializer
from ...services.staff_attendance_service import StaffAttendanceService

class StaffAttendanceController(BaseController):
    serializer_class = StaffAttendanceSerializer
    service_class = StaffAttendanceService
