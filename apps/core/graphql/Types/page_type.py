import strawberry
import strawberry_django
from apps.core.models import Page

@strawberry_django.type(Page)
class PageType:
    id: strawberry.ID
    title: strawberry.auto
    icon: strawberry.auto
    order: strawberry.auto
    link: strawberry.auto
    permission_tags: strawberry.scalars.JSON