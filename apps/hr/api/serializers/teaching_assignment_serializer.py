from apps.core.api.serializers import BaseSerializer
from ...models.teaching_assignment import TeachingAssignment

class TeachingAssignmentSerializer(BaseSerializer):
    class Meta:
        model = TeachingAssignment
        fields = '__all__'
