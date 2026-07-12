from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import SubjectGroup

class SubjectGroupSerializer(BaseSerializer):
    class Meta:
        model = SubjectGroup
        fields = "__all__"
