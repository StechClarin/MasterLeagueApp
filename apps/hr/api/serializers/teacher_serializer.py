from apps.core.api.serializers import BaseSerializer
from ...models.teacher import Teacher

class TeacherSerializer(BaseSerializer):
    class Meta:
        model = Teacher
        fields = '__all__'
