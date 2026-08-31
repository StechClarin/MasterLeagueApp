from apps.core.services.BaseService import BaseService
from ..models.intervention_request import InterventionRequest

class InterventionService(BaseService):
    model = InterventionRequest
