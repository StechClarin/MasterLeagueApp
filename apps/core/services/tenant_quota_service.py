# apps/core/services/tenant_quota_service.py
from apps.core.services.BaseService import BaseService
from ..models import TenantQuota

class TenantQuotaService(BaseService):
    model = TenantQuota
