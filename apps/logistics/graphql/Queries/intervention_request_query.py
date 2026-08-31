import graphene
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.intervention_request_type import InterventionRequestType
from ...models.intervention_request import InterventionRequest

InterventionRequestPaginatedType = get_paginated_type(InterventionRequestType)

class InterventionRequestQuery(graphene.ObjectType):
    intervention = graphene.Field(InterventionRequestType, id=graphene.ID(required=True))
    interventions = graphene.Field(
        InterventionRequestPaginatedType,
        search=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_intervention(root, info, id):
        try:
            queryset = InterventionRequest.objects.filter(pk=id)
            if hasattr(info.context, 'establishment_id') and info.context.establishment_id:
                queryset = queryset.filter(establishment_id=info.context.establishment_id)
            return queryset.get()
        except InterventionRequest.DoesNotExist:
            return None

    def resolve_interventions(root, info, search=None, page=1, page_size=10, **kwargs):
        from apps.core.graphql.utils.queryset_filter import get_context_filtered_queryset
        queryset = get_context_filtered_queryset(InterventionRequest, info, order_by='-reported_at')

        if search:
            queryset = queryset.filter(description__icontains=search)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return InterventionRequestPaginatedType(**paginated_data)
