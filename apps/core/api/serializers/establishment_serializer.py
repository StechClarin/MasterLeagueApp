from rest_framework.validators import UniqueTogetherValidator
from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import Establishment
from rest_framework import serializers

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

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Personnalisation de l'URL du logo
        if instance.logo and hasattr(instance.logo, 'url'):
            request = self.context.get('request')
            if request and hasattr(request, 'build_absolute_uri'):
                representation['logo'] = request.build_absolute_uri(instance.logo.url)
            else:
                from django.conf import settings
                representation['logo'] = f"{settings.MEDIA_URL}{instance.logo.name}"
        else:
            representation['logo'] = None
        return representation
