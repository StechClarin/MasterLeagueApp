from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models.level import Level

class LevelSerializer(BaseSerializer):
    class Meta:
        model = Level
        fields = "__all__"
        validators = [] # On désactive la validation unique par défaut pour la gérer dans le Service
