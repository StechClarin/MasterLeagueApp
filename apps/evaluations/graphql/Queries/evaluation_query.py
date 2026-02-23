import graphene
from django.db.models import Q
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.evaluation_type import EvaluationType
from ...models import Evaluation

EvaluationPaginatedType = get_paginated_type(EvaluationType)

class EvaluationQuery(graphene.ObjectType):
    evaluations = graphene.Field(
        EvaluationPaginatedType,
        search=graphene.String(),
        classroom_id=graphene.Int(),
        level_id=graphene.Int(),
        period_id=graphene.Int(),
        subject_id=graphene.Int(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_evaluations(root, info, search=None, classroom_id=None, level_id=None, period_id=None, subject_id=None, page=1, page_size=10, **kwargs):
        # Multi-tenancy Isolation
        est_id = getattr(info.context, 'establishment_id', None)
        queryset = Evaluation.objects.filter(establishment_id=est_id).order_by('-date', '-created_at')
        
        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(subject__name__icontains=search))
            
        if classroom_id:
            queryset = queryset.filter(classrooms__id=classroom_id)
            
        if level_id:
            queryset = queryset.filter(levels__id=level_id)
            
        if period_id:
            queryset = queryset.filter(academic_period_id=period_id)
            
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return EvaluationPaginatedType(**paginated_data)
