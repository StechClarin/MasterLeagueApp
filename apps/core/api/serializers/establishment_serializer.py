from rest_framework.validators import UniqueTogetherValidator
from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import Establishment
from rest_framework import serializers

class EstablishmentSerializer(BaseSerializer):
    logo = serializers.SerializerMethodField()

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

    def get_logo(self, obj):
        if not obj.logo or not hasattr(obj.logo, 'url'):
            return None
        request = self.context.get('request')
        if request and hasattr(request, 'build_absolute_uri'):
            return request.build_absolute_uri(obj.logo.url)
        from django.conf import settings
        return f"{settings.MEDIA_URL}{obj.logo.name}"
