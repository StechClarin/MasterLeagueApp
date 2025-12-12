from apps.core.api.controllers.BaseController import BaseController
from ..serializers.evenement_serializer import EvenementSerializer
from ...services.evenement_service import EvenementService

class EvenementController(BaseController):
    serializer_class = EvenementSerializer
    service_class = EvenementService
