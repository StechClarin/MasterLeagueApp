from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models.maintenance_record import MaintenanceRecord

class MaintenanceSerializer(BaseSerializer):
    class Meta:
        model = MaintenanceRecord
        fields = "__all__"
