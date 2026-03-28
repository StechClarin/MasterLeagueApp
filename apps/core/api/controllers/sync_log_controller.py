from apps.core.api.controllers.BaseController import BaseController
from ..serializers.sync_log_serializer import SyncLogSerializer
from ...services.sync_log_service import SyncLogService

class SyncLogController(BaseController):
    serializer_class = SyncLogSerializer
    service_class = SyncLogService
