import graphene
from graphene_django import DjangoObjectType
from apps.core.models import Establishment

class EstablishmentType(DjangoObjectType):
    logo = graphene.String()

    class Meta:
        model = Establishment
        fields = "__all__"

    def resolve_logo(self, info):
        if self.logo and hasattr(self.logo, 'url'):
            request = info.context
            if hasattr(request, 'build_absolute_uri'):
                return request.build_absolute_uri(self.logo.url)
            # Fallback en l'absence du request object HTTP
            from django.conf import settings
            return f"{settings.MEDIA_URL}{self.logo.name}"
        return None
