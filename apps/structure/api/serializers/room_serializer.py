from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import Room

class RoomSerializer(BaseSerializer):
    class Meta:
        model = Room
        fields = "__all__"
