from apps.core.api.controllers.BaseController import BaseController
from ..serializers.academic_year_serializer import AcademicYearSerializer
from ...services.academic_year_service import AcademicYearService

class AcademicYearController(BaseController):
    serializer_class = AcademicYearSerializer
    service_class = AcademicYearService
