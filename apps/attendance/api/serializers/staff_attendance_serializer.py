from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import StaffAttendance

class StaffAttendanceSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = StaffAttendance
        fields = '__all__'
