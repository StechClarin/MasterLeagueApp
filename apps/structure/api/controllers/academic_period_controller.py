from apps.core.api.controllers.BaseController import BaseController
from ..serializers.academic_period_serializer import AcademicPeriodSerializer
from ...services.academic_period_service import AcademicPeriodService

class AcademicPeriodController(BaseController):
    serializer_class = AcademicPeriodSerializer
    service_class = AcademicPeriodService
