from apps.core.services.BaseService import BaseService
from ..models.maintenance_record import MaintenanceRecord

class MaintenanceService(BaseService):
    model = MaintenanceRecord
