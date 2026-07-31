import strawberry
import strawberry_django
import typing
from apps.core.models import Establishment
from apps.profilmanagement.graphql.Types.user_type import UserType

@strawberry_django.type(Establishment)
class EstablishmentType:
    id: strawberry.ID
    code: strawberry.auto
    name: strawberry.auto
    address: strawberry.auto
    phone: strawberry.auto
    email: strawberry.auto
    created_at: strawberry.auto
    is_active: strawberry.auto
    slogan: strawberry.auto
    website: strawberry.auto
    tax_id: strawberry.auto
    city: strawberry.auto
    country: strawberry.auto
    print_footer: strawberry.auto
    user: typing.Optional[UserType]

    @strawberry.field
    def logo(self, info: strawberry.Info) -> str | None:
        if self.logo and hasattr(self.logo, 'url'):
            request = info.context.request if hasattr(info.context, 'request') else info.context
            if hasattr(request, 'build_absolute_uri'):
                return request.build_absolute_uri(self.logo.url)
            from django.conf import settings
            return f"{settings.MEDIA_URL}{self.logo.name}"
        return None

    @strawberry.field
    def print_header(self, info: strawberry.Info) -> str | None:
        if self.print_header and hasattr(self.print_header, 'url'):
            request = info.context.request if hasattr(info.context, 'request') else info.context
            if hasattr(request, 'build_absolute_uri'):
                return request.build_absolute_uri(self.print_header.url)
            from django.conf import settings
            return f"{settings.MEDIA_URL}{self.print_header.name}"
        return None
