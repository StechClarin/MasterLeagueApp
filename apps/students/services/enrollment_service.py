from apps.core.services.BaseService import BaseService
from ..models import Enrollment

class EnrollmentService(BaseService):
    model = Enrollment
