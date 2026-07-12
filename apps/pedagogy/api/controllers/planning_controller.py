from apps.core.api.controllers.BaseController import BaseController
from ..serializers.planning_serializer import PlanningSerializer
from ...services.planning_service import PlanningService
from ...services.planning_action_service import PlanningActionService
from rest_framework.response import Response
from rest_framework import status

class PlanningController(BaseController):
    serializer_class = PlanningSerializer
    service_class = PlanningService

    def cancel_event(self, request, *args, **kwargs):
        """ POST /api/pedagogy/planning/cancel_event/ """
        self.check_membership_permissions(request, 'change')
        
        event_id = request.data.get('event_id')
        target_date = request.data.get('target_date')
        event_type = request.data.get('event_type')
        est_id = getattr(request, 'establishment_id', None)

        if not all([event_id, target_date, event_type, est_id]):
            return Response({"detail": "Données manquantes (event_id, target_date, event_type)."}, status=status.HTTP_400_BAD_REQUEST)

        action_service = PlanningActionService()
        try:
            result = action_service.cancel_event(event_id, target_date, event_type, est_id, request.user.id)
            return self.success_response(result, result['message'], status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def reschedule_event(self, request, *args, **kwargs):
        """ POST /api/pedagogy/planning/reschedule_event/ """
        self.check_membership_permissions(request, 'change')
        
        event_id = request.data.get('event_id')
        original_date = request.data.get('original_date')
        new_date = request.data.get('new_date')
        event_type = request.data.get('event_type')
        new_start_time = request.data.get('new_start_time')
        new_end_time = request.data.get('new_end_time')
        new_room_id = request.data.get('new_room_id')
        est_id = getattr(request, 'establishment_id', None)

        if not all([event_id, original_date, new_date, event_type, est_id]):
            return Response({"detail": "Données manquantes (event_id, original_date, new_date, event_type)."}, status=status.HTTP_400_BAD_REQUEST)

        action_service = PlanningActionService()
        try:
            result = action_service.reschedule_event(event_id, original_date, new_date, event_type, est_id, request.user.id, new_start_time, new_end_time, new_room_id)
            return self.success_response(result, result['message'], status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
