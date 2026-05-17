from .BaseController import BaseController
from ..serializers.tenant_license_serializer import TenantLicenseSerializer
from ...services.tenant_license_service import TenantLicenseService

class TenantLicenseController(BaseController):
    serializer_class = TenantLicenseSerializer
    service_class = TenantLicenseService
