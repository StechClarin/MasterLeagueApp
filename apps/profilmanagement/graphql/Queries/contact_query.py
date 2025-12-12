import graphene
from django.core.paginator import Paginator
from ..Types.contact_type import ContactType
from ...models import Contact

class ContactQuery(graphene.ObjectType):
    contact = graphene.Field(ContactType, id=graphene.ID(required=True))
    contacts = graphene.List(ContactType)

    def resolve_contact(root, info, id):
        from ...services.contact_service import ContactService
        service = ContactService()
        try:
            return service.get_by_id(id)
        except Exception:
            return None

    def resolve_contacts(root, info, **kwargs):
        from ...services.contact_service import ContactService
        service = ContactService()
        return service.list(filters=kwargs)
