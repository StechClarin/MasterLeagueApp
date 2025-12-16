import graphene
from ..Types.subject_type import SubjectType
from apps.structure.models.subject import Subject
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from apps.core.graphql.utils.queryset_filter import get_context_filtered_queryset

class SubjectQuery(graphene.ObjectType):
    subject = graphene.Field(SubjectType, id=graphene.ID(required=True))
    subjects = graphene.Field(
        get_paginated_type(SubjectType),
        search=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_subject(root, info, id):
        try:
            return Subject.objects.get(pk=id)
        except Subject.DoesNotExist:
            return None

    def resolve_subjects(root, info, search=None, page=1, page_size=10, **kwargs):
        queryset = get_context_filtered_queryset(Subject, info, order_by='name')
        
        if search:
            queryset = queryset.filter(name__icontains=search)
            
        return paginate_queryset(queryset, page, page_size)
