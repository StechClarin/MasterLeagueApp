from apps.core.services.BaseService import BaseService
from ..models import Contact

class ContactService(BaseService):
    model = Contact
