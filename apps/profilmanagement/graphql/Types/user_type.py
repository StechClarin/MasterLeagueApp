import strawberry
import strawberry_django
from ...models import User
from .role_type import RoleType

@strawberry_django.type(User)
class UserType:
    id: strawberry.ID
    username: strawberry.auto
    email: strawberry.auto
    first_name: strawberry.auto
    last_name: strawberry.auto
    phone: strawberry.auto
    is_active: strawberry.auto
    date_joined: strawberry.auto

    @strawberry.field
    def photo(self, info: strawberry.Info) -> str | None:
        if self.photo and hasattr(self.photo, 'url'):
            request = info.context.request if hasattr(info.context, 'request') else info.context
            if hasattr(request, 'build_absolute_uri'):
                return request.build_absolute_uri(self.photo.url)
            from django.conf import settings
            return f"{settings.MEDIA_URL}{self.photo.name}"
        return None

    @strawberry.field
    def roles(self, info: strawberry.Info) -> list[RoleType]:
        from apps.profilmanagement.models.role import Role
        request = info.context.request if hasattr(info.context, 'request') else info.context
        establishment_id = getattr(request, 'establishment_id', None)
        
        if establishment_id:
            membership = self.memberships.filter(establishment_id=establishment_id, status='active').first()
            if membership:
                return list(membership.roles.exclude(name__iexact='Admin Master'))
            return []
            
        # Si pas de contexte d'établissement, on retourne tous les rôles actifs distincts
        return list(Role.objects.filter(
            memberships__user=self,
            memberships__status='active'
        ).distinct().exclude(name__iexact='Admin Master'))
