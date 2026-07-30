import strawberry
import strawberry_django
from apps.core.models import EstablishmentMembership

@strawberry_django.type(EstablishmentMembership)
class EstablishmentMembershipType:
    id: strawberry.ID
    status: strawberry.auto
    is_owner: strawberry.auto
