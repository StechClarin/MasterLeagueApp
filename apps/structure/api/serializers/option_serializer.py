from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import Option

class OptionSerializer(BaseSerializer):
    class Meta:
        model = Option
        fields = "__all__"
