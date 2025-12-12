import graphene
from django.core.paginator import Paginator
from ..Types.ecole_type import EcoleType

class EcolePaginatedType(graphene.ObjectType):
    items = graphene.List(EcoleType)
    total_count = graphene.Int()
    num_pages = graphene.Int()
    current_page = graphene.Int()
    page_size = graphene.Int()

class EcoleQuery(graphene.ObjectType):
    ecole = graphene.Field(EcoleType, id=graphene.ID(required=True))
    ecoles = graphene.Field(
        EcolePaginatedType,
        nom=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_ecole(root, info, id):
        from ...services.ecole_service import EcoleService
        service = EcoleService()
        try:
            return service.get_by_id(id)
        except Exception:
            return None

    def resolve_ecoles(root, info, nom=None, page=1, page_size=10, **kwargs):
        from ...services.ecole_service import EcoleService
        service = EcoleService()
        
        filters = {}
        if nom:
            filters['nom__icontains'] = nom
            
        queryset = service.list(filters=filters)
        
        paginator = Paginator(queryset, page_size)
        try:
            page_obj = paginator.page(page)
        except:
            page_obj = paginator.page(1)

        return EcolePaginatedType(
            items=page_obj.object_list,
            total_count=paginator.count,
            num_pages=paginator.num_pages,
            current_page=page_obj.number,
            page_size=page_size
        )
