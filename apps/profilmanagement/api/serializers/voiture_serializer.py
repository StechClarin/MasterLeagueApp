from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import Voiture

class VoitureSerializer(BaseSerializer):
    class Meta:
        model = Voiture
        fields = "__all__"
