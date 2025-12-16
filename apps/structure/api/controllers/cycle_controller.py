from apps.core.api.controllers.BaseController import BaseController
from ..serializers.cycle_serializer import CycleSerializer
from ...services.cycle_service import CycleService

class CycleController(BaseController):
    serializer_class = CycleSerializer
    service_class = CycleService
