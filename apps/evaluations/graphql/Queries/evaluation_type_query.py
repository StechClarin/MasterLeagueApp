import graphene
from django.db.models import Q
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.evaluation_type_type import EvaluationTypeType
from ...models import EvaluationType

EvaluationTypePaginatedType = get_paginated_type(EvaluationTypeType)

class EvaluationTypeQuery(graphene.ObjectType):
    evaluation_types = graphene.Field(
        EvaluationTypePaginatedType,
        search=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_evaluation_types(root, info, search=None, page=1, page_size=10, **kwargs):
        # Multi-tenancy Isolation
        est_id = getattr(info.context, 'establishment_id', None)
        queryset = EvaluationType.objects.filter(establishment_id=est_id).order_by('name')
        
        if search:
            queryset = queryset.filter(Q(name__icontains=search))

        paginated_data = paginate_queryset(queryset, page, page_size)
        return EvaluationTypePaginatedType(**paginated_data)
