from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import Planning

from .planning_detail_serializer import PlanningDetailSerializer

class PlanningSerializer(BaseSerializer):
    details = PlanningDetailSerializer(many=True, required=False)

    class Meta:
        model = Planning
        fields = "__all__"
        read_only_fields = ['establishment']
