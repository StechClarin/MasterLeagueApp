from apps.core.api.controllers.BaseController import BaseController
from ..serializers.maintenance_serializer import MaintenanceSerializer
from ...services.maintenance_service import MaintenanceService

class MaintenanceRecordController(BaseController):
    serializer_class = MaintenanceSerializer
    service_class = MaintenanceService
