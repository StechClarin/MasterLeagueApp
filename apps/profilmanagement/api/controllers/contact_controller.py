from apps.core.api.controllers.BaseController import BaseController
from ..serializers.contact_serializer import ContactSerializer
from ...services.contact_service import ContactService

class ContactController(BaseController):
    serializer_class = ContactSerializer
    service_class = ContactService
