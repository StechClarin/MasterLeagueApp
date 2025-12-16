from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models.subject import Subject
from .level_subject_serializer import LevelSubjectSerializer

class SubjectSerializer(BaseSerializer):
    level_subjects = LevelSubjectSerializer(many=True, required=False)

    class Meta:
        model = Subject
        fields = "__all__"
