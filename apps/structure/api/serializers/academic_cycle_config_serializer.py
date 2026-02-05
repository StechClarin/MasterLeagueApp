from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models.academic_cycle_config import AcademicCycleConfig

class AcademicCycleConfigSerializer(BaseSerializer):
    class Meta:
        model = AcademicCycleConfig
        fields = '__all__'
