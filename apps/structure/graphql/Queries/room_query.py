import graphene
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.room_type import RoomType
from ...models import Room

RoomPaginatedType = get_paginated_type(RoomType)

class RoomQuery(graphene.ObjectType):
    room = graphene.Field(RoomType, id=graphene.ID(required=True))
    rooms = graphene.Field(
        RoomPaginatedType,
        search=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_room(root, info, id):
        try:
            queryset = Room.objects.filter(pk=id)
            if hasattr(info.context, 'establishment_id') and info.context.establishment_id:
                queryset = queryset.filter(establishment_id=info.context.establishment_id)
            return queryset.get()
        except Room.DoesNotExist:
            return None

    def resolve_rooms(root, info, search=None, page=1, page_size=10, **kwargs):
        from apps.core.graphql.utils.queryset_filter import get_context_filtered_queryset
        queryset = get_context_filtered_queryset(Room, info, order_by='-created_at')

        if search:
            queryset = queryset.filter(name__icontains=search)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return RoomPaginatedType(**paginated_data)
