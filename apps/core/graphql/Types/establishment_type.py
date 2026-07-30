import strawberry
import strawberry_django
from apps.core.models import Establishment

@strawberry_django.type(Establishment)
class EstablishmentType:
    id: strawberry.ID
    code: strawberry.auto
    name: strawberry.auto
    address: strawberry.auto
    phone: strawberry.auto
    email: strawberry.auto
    created_at: strawberry.auto

    @strawberry.field
    def logo(self, info: strawberry.Info) -> str | None:
        if self.logo and hasattr(self.logo, 'url'):
            request = info.context.request if hasattr(info.context, 'request') else info.context
            if hasattr(request, 'build_absolute_uri'):
                return request.build_absolute_uri(self.logo.url)
            from django.conf import settings
            return f"{settings.MEDIA_URL}{self.logo.name}"
        return None
