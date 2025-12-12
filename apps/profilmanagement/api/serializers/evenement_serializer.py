from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import Evenement

class EvenementSerializer(BaseSerializer):
    class Meta:
        model = Evenement
        fields = "__all__"
