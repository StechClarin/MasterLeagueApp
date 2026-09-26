# apps/core/api/controllers/tenant_quota_controller.py
from apps.core.api.controllers.BaseController import BaseController
from ..serializers.tenant_quota_serializer import TenantQuotaSerializer
from ...services.tenant_quota_service import TenantQuotaService

class TenantQuotaController(BaseController):
    serializer_class = TenantQuotaSerializer
    service_class = TenantQuotaService
