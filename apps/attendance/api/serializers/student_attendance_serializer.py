from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import StudentAttendance

class StudentAttendanceSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = StudentAttendance
        fields = '__all__'
