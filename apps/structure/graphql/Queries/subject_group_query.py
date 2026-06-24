import graphene
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.subject_group_type import SubjectGroupType
from ...models import SubjectGroup

SubjectGroupPaginatedType = get_paginated_type(SubjectGroupType)

class SubjectGroupQuery(graphene.ObjectType):
    subjectgroup = graphene.Field(SubjectGroupType, id=graphene.ID(required=True))
    subjectgroups = graphene.Field(
        SubjectGroupPaginatedType,
        search=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_subjectgroup(root, info, id):
        try:
            return SubjectGroup.objects.get(pk=id)
        except SubjectGroup.DoesNotExist:
            return None

    def resolve_subjectgroups(root, info, search=None, page=1, page_size=10, **kwargs):
        queryset = SubjectGroup.objects.all().order_by('-created_at')

        if search:
            queryset = queryset.filter(name__icontains=search)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return SubjectGroupPaginatedType(**paginated_data)
