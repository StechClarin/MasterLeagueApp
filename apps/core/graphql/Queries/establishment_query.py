import strawberry
from ..Types.establishment_type import EstablishmentType
from apps.core.graphql.Types.paginated_type import PaginatedType
from apps.core.models import Establishment
from apps.core.utils.pagination import paginate_queryset

from django.db.models import Q
from django.core.exceptions import ObjectDoesNotExist

@strawberry.type
class EstablishmentQuery:
    @strawberry.field
    def establishments(
        self,
        info: strawberry.Info,
        search: str | None = None,
        city: str | None = None,
        phone: str | None = None,
        is_active: bool | None = None,
        user_id: strawberry.ID | None = None,
        page: int = 1,
        page_size: int = 10
    ) -> PaginatedType[EstablishmentType] | None:
        request = info.context.request if hasattr(info.context, 'request') else info.context
        user = request.user
        if not user.is_authenticated:
            return None
            
        target_user_id = user_id if user_id else user.id
        
        if user.is_superuser:
            queryset = Establishment.objects.all().order_by('name')
        else:
            q_owner = Q(user_id=target_user_id)
            q_member = Q(memberships__user_id=target_user_id, memberships__status='active')
            queryset = Establishment.objects.filter(
                Q(q_owner, q_member, _connector=Q.OR)
            ).distinct().order_by('name')
        
        if search:
            q_name = Q(name__icontains=search)
            q_city = Q(city__icontains=search)
            q_phone = Q(phone__icontains=search)
            queryset = queryset.filter(
                Q(q_name, q_city, q_phone, _connector=Q.OR)
            )

        if city:
            queryset = queryset.filter(city__icontains=city)
        if phone:
            queryset = queryset.filter(phone__icontains=phone)
        if is_active is not None:
             queryset = queryset.filter(is_active=is_active)

        paginated_data = paginate_queryset(queryset, page, page_size)
        paginated_data['items'] = list(paginated_data['items'])
        return PaginatedType[EstablishmentType](**paginated_data)

    @strawberry.field
    def establishment(self, info: strawberry.Info, id: strawberry.ID) -> EstablishmentType | None:
        request = info.context.request if hasattr(info.context, 'request') else info.context
        user = request.user
        if not user.is_authenticated:
            return None
        if user.is_superuser:
            try:
                return Establishment.objects.get(pk=id)
            except ObjectDoesNotExist:
                return None
        try:
            q_owner = Q(user=user)
            q_member = Q(memberships__user=user, memberships__status='active')
            q_or = Q(q_owner, q_member, _connector=Q.OR)
            return Establishment.objects.filter(
                Q(pk=id),
                q_or
            ).distinct().get()
        except ObjectDoesNotExist:
            return None
