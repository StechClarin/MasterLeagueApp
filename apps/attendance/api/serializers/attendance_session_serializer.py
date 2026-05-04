from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import AttendanceSession

class AttendanceSessionSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = AttendanceSession
        fields = '__all__'
