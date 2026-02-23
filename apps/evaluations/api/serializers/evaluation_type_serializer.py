from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import EvaluationType

class EvaluationTypeSerializer(BaseSerializer):
    class Meta:
        model = EvaluationType
        fields = "__all__"
