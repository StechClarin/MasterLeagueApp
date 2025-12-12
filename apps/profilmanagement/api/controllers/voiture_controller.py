from apps.core.api.controllers.BaseController import BaseController
from ..serializers.voiture_serializer import VoitureSerializer
from ...services.voiture_service import VoitureService

class VoitureController(BaseController):
    serializer_class = VoitureSerializer
    service_class = VoitureService
