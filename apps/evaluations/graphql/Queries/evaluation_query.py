import graphene
from django.db.models import Q
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.evaluation_session_type import EvaluationSessionType
from ..Types.evaluation_planning_type import EvaluationPlanningType
from ...models import EvaluationSession, EvaluationPlanning

EvaluationSessionPaginatedType = get_paginated_type(EvaluationSessionType)
EvaluationPlanningPaginatedType = get_paginated_type(EvaluationPlanningType)

class EvaluationSessionQuery(graphene.ObjectType):
    evaluation_sessions = graphene.Field(
        EvaluationSessionPaginatedType,
        search=graphene.String(),
        classroom_id=graphene.Int(),
        level_id=graphene.Int(),
        period_id=graphene.Int(),
        subject_id=graphene.Int(),
        evaluation_type_id=graphene.Int(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    evaluation_session = graphene.Field(
        EvaluationSessionType,
        id=graphene.ID(required=True)
    )

    evaluation_plannings = graphene.Field(
        EvaluationPlanningPaginatedType,
        classe_id=graphene.ID(),
        min_date=graphene.Date(),
        max_date=graphene.Date(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=100)
    )

    def resolve_evaluation_session(root, info, id, **kwargs):
        est_id = getattr(info.context, 'establishment_id', None)
        return EvaluationSession.objects.filter(establishment_id=est_id).get(id=id)

    def resolve_evaluation_sessions(root, info, search=None, classroom_id=None, level_id=None, period_id=None, subject_id=None, evaluation_type_id=None, page=1, page_size=10, **kwargs):
        # Multi-tenancy Isolation
        est_id = getattr(info.context, 'establishment_id', None)
        queryset = EvaluationSession.objects.filter(establishment_id=est_id).order_by('-created_at')
        
        if search:
            queryset = queryset.filter(Q(title__icontains=search))
            
        if evaluation_type_id:
            queryset = queryset.filter(evaluation_type_id=evaluation_type_id)

        if period_id:
            queryset = queryset.filter(academic_period_id=period_id)
            
        # Filters through related models
        if subject_id:
            queryset = queryset.filter(subjects__subject_id=subject_id)
            
        if level_id:
            queryset = queryset.filter(subjects__levels__id=level_id)

        if classroom_id:
            queryset = queryset.filter(subjects__plannings__classrooms__id=classroom_id)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return EvaluationSessionPaginatedType(**paginated_data)

    def resolve_evaluation_plannings(root, info, classe_id=None, min_date=None, max_date=None, page=1, page_size=100, **kwargs):
        est_id = getattr(info.context, 'establishment_id', None)
        queryset = EvaluationPlanning.objects.filter(establishment_id=est_id).order_by('date', 'start_time')

        if classe_id:
            queryset = queryset.filter(classrooms__id=classe_id)

        if min_date:
            queryset = queryset.filter(date__gte=min_date)

        if max_date:
            queryset = queryset.filter(date__lte=max_date)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return EvaluationPlanningPaginatedType(**paginated_data)
