from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models.academic_year import AcademicYear
from .academic_cycle_config_serializer import AcademicCycleConfigSerializer

class AcademicYearSerializer(BaseSerializer):
    cycle_configs = AcademicCycleConfigSerializer(many=True, read_only=True)
    
    class Meta:
        model = AcademicYear
        fields = "__all__"
