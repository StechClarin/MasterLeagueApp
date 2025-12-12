import graphene
from django.core.paginator import Paginator
from ..Types.personne_type import PersonneType
from ...models import Personne

class PersonnePaginatedType(graphene.ObjectType):
    items = graphene.List(PersonneType)
    total_count = graphene.Int()
    num_pages = graphene.Int()
    current_page = graphene.Int()
    page_size = graphene.Int()

class PersonneQuery(graphene.ObjectType):
    personne = graphene.Field(PersonneType, id=graphene.ID(required=True))
    personnes = graphene.Field(
        PersonnePaginatedType,
        nom=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_personne(root, info, id):
        from ...services.personne_service import PersonneService
        service = PersonneService()
        try:
            return service.get_by_id(id)
        except Exception:
            return None

    def resolve_personnes(root, info, nom=None, page=1, page_size=10, **kwargs):
        from ...services.personne_service import PersonneService
        service = PersonneService()
        
        filters = {}
        if nom:
            filters['nom__icontains'] = nom
            
        queryset = service.list(filters=filters)
        
        # Pagination
        paginator = Paginator(queryset, page_size)
        
        try:
            page_obj = paginator.page(page)
        except:
            page_obj = paginator.page(1)

        return PersonnePaginatedType(
            items=page_obj.object_list,
            total_count=paginator.count,
            num_pages=paginator.num_pages,
            current_page=page_obj.number,
            page_size=page_size
        )
