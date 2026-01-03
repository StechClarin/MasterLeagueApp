import graphene
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.contract_type_type import ContractTypeType
from ...models import ContractType

ContractTypePaginatedType = get_paginated_type(ContractTypeType)

class ContractTypeQuery(graphene.ObjectType):
    contract_type = graphene.Field(ContractTypeType, id=graphene.ID(required=True))
    contract_types = graphene.Field(
        ContractTypePaginatedType,
        search=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_contract_type(root, info, id):
        try:
            return ContractType.objects.get(pk=id)
        except ContractType.DoesNotExist:
            return None

    def resolve_contract_types(root, info, search=None, page=1, page_size=10, **kwargs):
        queryset = ContractType.objects.all().order_by('code')

        if search:
            queryset = queryset.filter(designation__icontains=search)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return ContractTypePaginatedType(**paginated_data)
