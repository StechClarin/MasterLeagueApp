from .BaseSerializer import BaseSerializer
from ...models import TenantLicense

class TenantLicenseSerializer(BaseSerializer):
    class Meta:
        model = TenantLicense
        fields = '__all__'
