from apps.core.api.controllers.BaseController import BaseController
from ..serializers.planning_detail_serializer import PlanningDetailSerializer
from ...services.planning_detail_service import PlanningDetailService

class PlanningDetailController(BaseController):
    serializer_class = PlanningDetailSerializer
    service_class = PlanningDetailService
