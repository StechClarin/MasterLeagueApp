from apps.core.api.serializers import BaseSerializer
from ...models import StudentHealth

class StudentHealthSerializer(BaseSerializer):
    class Meta:
        model = StudentHealth
        fields = '__all__'
        read_only_fields = ['student', 'establishment']
