from apps.core.api.controllers.BaseController import BaseController
from ..serializers.personnel_serializer import PersonnelSerializer
from ...services.personnel_service import PersonnelService

class PersonnelController(BaseController):
    serializer_class = PersonnelSerializer
    service_class = PersonnelService
