from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models.level_subject import LevelSubject

class LevelSubjectSerializer(BaseSerializer):
    class Meta:
        model = LevelSubject
        fields = "__all__"
        extra_kwargs = {
            'establishment': {'required': False, 'read_only': True},
            'subject': {'required': False, 'read_only': True}
        }
