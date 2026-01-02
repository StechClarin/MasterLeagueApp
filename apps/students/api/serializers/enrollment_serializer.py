from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import Enrollment

class EnrollmentSerializer(BaseSerializer):
    class Meta:
        model = Enrollment
        fields = "__all__"
