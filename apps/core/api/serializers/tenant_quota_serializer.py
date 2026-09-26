# apps/core/api/serializers/tenant_quota_serializer.py
from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import TenantQuota

class TenantQuotaSerializer(BaseSerializer):
    class Meta:
        model = TenantQuota
        fields = '__all__'
