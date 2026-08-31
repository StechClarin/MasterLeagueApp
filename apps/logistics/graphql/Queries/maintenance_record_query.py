import graphene
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.maintenance_record_type import MaintenanceRecordType
from ...models.maintenance_record import MaintenanceRecord

MaintenanceRecordPaginatedType = get_paginated_type(MaintenanceRecordType)

class MaintenanceRecordQuery(graphene.ObjectType):
    maintenance = graphene.Field(MaintenanceRecordType, id=graphene.ID(required=True))
    maintenances = graphene.Field(
        MaintenanceRecordPaginatedType,
        search=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_maintenance(root, info, id):
        try:
            queryset = MaintenanceRecord.objects.filter(pk=id)
            if hasattr(info.context, 'establishment_id') and info.context.establishment_id:
                queryset = queryset.filter(establishment_id=info.context.establishment_id)
            return queryset.get()
        except MaintenanceRecord.DoesNotExist:
            return None

    def resolve_maintenances(root, info, search=None, page=1, page_size=10, **kwargs):
        from apps.core.graphql.utils.queryset_filter import get_context_filtered_queryset
        queryset = get_context_filtered_queryset(MaintenanceRecord, info, order_by='-performed_at')

        if search:
            queryset = queryset.filter(description__icontains=search)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return MaintenanceRecordPaginatedType(**paginated_data)
