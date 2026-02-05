from apps.core.api.controllers.BaseController import BaseController
from ..serializers.academic_cycle_config_serializer import AcademicCycleConfigSerializer
from ...services.academic_cycle_config_service import AcademicCycleConfigService

class AcademicCycleConfigController(BaseController):
    serializer_class = AcademicCycleConfigSerializer
    service_class = AcademicCycleConfigService
