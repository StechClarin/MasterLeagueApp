from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import AcademicPeriod

class AcademicPeriodSerializer(BaseSerializer):
    class Meta:
        model = AcademicPeriod
        fields = "__all__"
