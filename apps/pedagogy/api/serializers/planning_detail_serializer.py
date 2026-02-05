from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models.planningdetail import PlanningDetail

class PlanningDetailSerializer(BaseSerializer):
    class Meta:
        model = PlanningDetail
        fields = '__all__'
