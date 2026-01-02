import graphene
from ..Types.classroom_type import ClassRoomType
from apps.structure.models.classroom import ClassRoom
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from apps.core.graphql.utils.queryset_filter import get_context_filtered_queryset

class ClassRoomQuery(graphene.ObjectType):
    classroom = graphene.Field(ClassRoomType, id=graphene.ID(required=True))
    classrooms = graphene.Field(
        get_paginated_type(ClassRoomType),
        search=graphene.String(),
        level_id=graphene.ID(),
        academic_year_id=graphene.ID(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_classroom(root, info, id):
        try:
            return ClassRoom.objects.get(pk=id)
        except ClassRoom.DoesNotExist:
            return None

    def resolve_classrooms(root, info, search=None, page=1, page_size=10, **kwargs):
        queryset = get_context_filtered_queryset(ClassRoom, info, order_by='name')
        
        if search:
            queryset = queryset.filter(name__icontains=search)
            
        level_id = kwargs.get('level_id')
        if level_id:
            queryset = queryset.filter(level_id=level_id)

        academic_year_id = kwargs.get('academic_year_id')
        if academic_year_id:
            queryset = queryset.filter(academic_year_id=academic_year_id)
            
        return paginate_queryset(queryset, page, page_size)
