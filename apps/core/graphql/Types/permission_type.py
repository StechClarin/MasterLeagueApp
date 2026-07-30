import strawberry
import strawberry_django
from apps.core.models.permission import Permission

@strawberry_django.type(Permission)
class PermissionType:
    id: strawberry.ID
    name: strawberry.auto
    codename: strawberry.auto
    tag: strawberry.auto
