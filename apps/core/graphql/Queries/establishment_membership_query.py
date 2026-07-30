import strawberry
from ..Types.establishment_membership_type import EstablishmentMembershipType
from apps.core.graphql.Types.paginated_type import PaginatedType
from apps.core.models import EstablishmentMembership
from apps.core.utils.pagination import paginate_queryset

@strawberry.type
class EstablishmentMembershipQuery:
    @strawberry.field
    def memberships(
        self,
        info: strawberry.Info,
        user_id: strawberry.ID | None = None,
        establishment_id: strawberry.ID | None = None,
        status: str | None = None,
        page: int = 1,
        page_size: int = 10
    ) -> PaginatedType[EstablishmentMembershipType] | None:
        request = info.context.request if hasattr(info.context, 'request') else info.context
        user = request.user
        if not user.is_authenticated:
            return None
            
        queryset = EstablishmentMembership.objects.all().order_by('-id')
        
        # Filtres
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if establishment_id:
            queryset = queryset.filter(establishment_id=establishment_id)
        if status:
            queryset = queryset.filter(status=status)

        paginated_data = paginate_queryset(queryset, page, page_size)
        paginated_data['items'] = list(paginated_data['items'])
        return PaginatedType[EstablishmentMembershipType](**paginated_data)

    @strawberry.field
    def membership(self, info: strawberry.Info, id: strawberry.ID) -> EstablishmentMembershipType | None:
        request = info.context.request if hasattr(info.context, 'request') else info.context
        user = request.user
        if not user.is_authenticated:
            return None
        try:
            return EstablishmentMembership.objects.get(pk=id)
        except EstablishmentMembership.DoesNotExist:
            return None
