from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models.academic_year import AcademicYear

class AcademicYearSerializer(BaseSerializer):
    class Meta:
        model = AcademicYear
        fields = "__all__"
