from apps.core.api.controllers.BaseController import BaseController
from ..serializers.personne_serializer import PersonneSerializer
from ...services.personne_service import PersonneService

class PersonneController(BaseController):
    serializer_class = PersonneSerializer
    service_class = PersonneService
