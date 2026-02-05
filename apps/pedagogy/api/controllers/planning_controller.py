from apps.core.api.controllers.BaseController import BaseController
from ..serializers.planning_serializer import PlanningSerializer
from ...services.planning_service import PlanningService

class PlanningController(BaseController):
    serializer_class = PlanningSerializer
    service_class = PlanningService
