from apps.core.services.BaseService import BaseService
from ..models import StudentAttendance

class StudentAttendanceService(BaseService):
    model = StudentAttendance
