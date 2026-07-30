import strawberry
import strawberry_django
from apps.core.models import Module
from .page_type import PageType

@strawberry_django.type(Module)
class ModuleType:
    id: strawberry.ID
    code: strawberry.auto
    name: strawberry.auto
    order: strawberry.auto
    display_mod: strawberry.auto
    icon: strawberry.auto

    @strawberry.field
    def pages(self) -> list[PageType]:
        return list(self.pages.all())