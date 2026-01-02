from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import Personnel
from apps.profilmanagement.api.serializers.user_serializer import UserSerializer

class PersonnelSerializer(BaseSerializer):
    user = UserSerializer(required=False)

    class Meta:
        model = Personnel
        fields = "__all__"
