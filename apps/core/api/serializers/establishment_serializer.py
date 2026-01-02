from rest_framework.validators import UniqueTogetherValidator
from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import Establishment

class EstablishmentSerializer(BaseSerializer):
    class Meta:
        model = Establishment
        fields = "__all__"
        validators = [
            UniqueTogetherValidator(
                queryset=Establishment.objects.all(),
                fields=['name', 'city'],
                message="Un établissement avec ce nom existe déjà dans cette ville."
            )
        ]
