from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models.classroom import ClassRoom

class ClassRoomSerializer(BaseSerializer):
    class Meta:
        model = ClassRoom
        fields = "__all__"
