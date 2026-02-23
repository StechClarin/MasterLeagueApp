from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import Grade

class GradeSerializer(BaseSerializer):
    class Meta:
        model = Grade
        fields = "__all__"
