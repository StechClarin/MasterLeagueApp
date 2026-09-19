import graphene
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from apps.core.graphql.utils.queryset_filter import get_context_filtered_queryset
from ..Types.subject_group_type import SubjectGroupType
from ...models import SubjectGroup

SubjectGroupPaginatedType = get_paginated_type(SubjectGroupType)

class SubjectGroupQuery(graphene.ObjectType):
    subjectgroup = graphene.Field(SubjectGroupType, id=graphene.ID(required=True))
    subjectgroups = graphene.Field(
        SubjectGroupPaginatedType,
        search=graphene.String(),
        establishment_id=graphene.ID(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_subjectgroup(root, info, id):
        try:
            return SubjectGroup.objects.get(pk=id)
        except SubjectGroup.DoesNotExist:
            return None

    def resolve_subjectgroups(root, info, search=None, establishment_id=None, page=1, page_size=10, **kwargs):
        queryset = get_context_filtered_queryset(SubjectGroup, info, order_by='name')

        if search:
            queryset = queryset.filter(name__icontains=search)

        if establishment_id:
            queryset = queryset.filter(establishment_id=establishment_id)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return SubjectGroupPaginatedType(**paginated_data)
