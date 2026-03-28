from apps.core.services.BaseService import BaseService
from ..models import SyncLog

class SyncLogService(BaseService):
    model = SyncLog
