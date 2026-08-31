from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models.intervention_request import InterventionRequest

class InterventionSerializer(BaseSerializer):
    class Meta:
        model = InterventionRequest
        fields = "__all__"
