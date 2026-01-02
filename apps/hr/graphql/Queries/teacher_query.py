import graphene
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.teacher_type import TeacherType
from ...models.teacher import Teacher
from django.db.models import Q

TeacherPaginatedType = get_paginated_type(TeacherType)

class TeacherQuery(graphene.ObjectType):
    teacher = graphene.Field(TeacherType, id=graphene.ID(required=True))
    teachers = graphene.Field(
        TeacherPaginatedType,
        search=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_teacher(root, info, id):
        try:
            return Teacher.objects.get(pk=id)
        except Teacher.DoesNotExist:
            return None

    def resolve_teachers(root, info, search=None, page=1, page_size=10, **kwargs):
        queryset = Teacher.objects.all().order_by('-created_at')

        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) | 
                Q(user__last_name__icontains=search) | 
                Q(matricule__icontains=search)
            )

        paginated_data = paginate_queryset(queryset, page, page_size)
        return TeacherPaginatedType(**paginated_data)
