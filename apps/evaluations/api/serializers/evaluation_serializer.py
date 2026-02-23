from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import Evaluation
from apps.hr.api.serializers.personnel_serializer import PersonnelSerializer
from apps.structure.api.serializers.classroom_serializer import ClassRoomSerializer
from apps.structure.api.serializers.level_serializer import LevelSerializer

class EvaluationSerializer(BaseSerializer):
    # Support Nested Writes for ManyToMany if needed, but BaseSerializer handles IDs by default.
    # We might want to see the details in read mode.
    
    class Meta:
        model = Evaluation
        fields = "__all__"
