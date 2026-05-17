from apps.core.services.BaseService import BaseService
from ..models import TenantLicense

class TenantLicenseService(BaseService):
    model = TenantLicense
