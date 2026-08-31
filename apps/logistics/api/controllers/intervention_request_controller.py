from apps.core.api.controllers.BaseController import BaseController
from ..serializers.intervention_serializer import InterventionSerializer
from ...services.intervention_service import InterventionService

class InterventionRequestController(BaseController):
    serializer_class = InterventionSerializer
    service_class = InterventionService
