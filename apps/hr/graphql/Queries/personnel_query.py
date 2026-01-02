import graphene
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.personnel_type import PersonnelType
from ...models import Personnel

PersonnelPaginatedType = get_paginated_type(PersonnelType)

class PersonnelQuery(graphene.ObjectType):
    personnel = graphene.Field(PersonnelType, id=graphene.ID(required=True))
    personnels = graphene.Field(
        PersonnelPaginatedType,
        search=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_personnel(root, info, id):
        try:
            return Personnel.objects.get(pk=id)
        except Personnel.DoesNotExist:
            return None

    def resolve_personnels(root, info, search=None, page=1, page_size=10, **kwargs):
        queryset = Personnel.objects.all().order_by('-created_at')

        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) | 
                Q(user__last_name__icontains=search) | 
                Q(matricule__icontains=search)
            )

        paginated_data = paginate_queryset(queryset, page, page_size)
        return PersonnelPaginatedType(**paginated_data)
