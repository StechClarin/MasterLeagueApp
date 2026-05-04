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
        establishment=graphene.ID(),
        contract_type=graphene.ID(),
        role=graphene.ID(),
        role_name=graphene.String(),
        job_title=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_personnel(root, info, id):
        try:
            return Personnel.objects.get(pk=id)
        except Personnel.DoesNotExist:
            return None

    def resolve_personnels(root, info, search=None, establishment=None, contract_type=None, role=None, role_name=None, job_title=None, page=1, page_size=10, **kwargs):
        queryset = Personnel.objects.all().select_related('user', 'contract_type', 'establishment').prefetch_related('roles').order_by('-created_at')

        # 2. Context Filtering (Establishment Isolation)
        if hasattr(info.context, 'establishment_id') and info.context.establishment_id:
             queryset = queryset.filter(establishment_id=info.context.establishment_id)
        elif establishment:
             queryset = queryset.filter(establishment_id=establishment)

        if contract_type:
            queryset = queryset.filter(contract_type_id=contract_type)

        if role:
            queryset = queryset.filter(roles__id=role)

        if role_name:
            queryset = queryset.filter(roles__name=role_name)

        if job_title:
            queryset = queryset.filter(job_title__icontains=job_title)

        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) | 
                Q(user__last_name__icontains=search) | 
                Q(matricule__icontains=search) |
                Q(phone_number__icontains=search) |
                Q(job_title__icontains=search)
            ).distinct()

        paginated_data = paginate_queryset(queryset, page, page_size)
        return PersonnelPaginatedType(**paginated_data)
