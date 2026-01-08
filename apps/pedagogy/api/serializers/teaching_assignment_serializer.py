from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import TeachingAssignment

class TeachingAssignmentSerializer(BaseSerializer):
    class Meta:
        model = TeachingAssignment
        fields = "__all__"
