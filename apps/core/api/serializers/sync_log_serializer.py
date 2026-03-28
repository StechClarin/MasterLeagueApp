from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models.sync_log import SyncLog

class SyncLogSerializer(BaseSerializer):
    class Meta:
        model = SyncLog
        fields = '__all__'
