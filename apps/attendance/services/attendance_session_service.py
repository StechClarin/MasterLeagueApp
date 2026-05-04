from apps.core.services.BaseService import BaseService
from ..models import AttendanceSession

class AttendanceSessionService(BaseService):
    model = AttendanceSession
