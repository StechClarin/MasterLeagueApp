from apps.core.api.controllers.BaseController import BaseController
from ..serializers.evaluation_serializer import EvaluationSessionSerializer
from ...services import EvaluationSessionService
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status


class EvaluationSessionController(BaseController):
    serializer_class = EvaluationSessionSerializer
    service_class = EvaluationSessionService

    @action(detail=True, methods=['post'])
    def status(self, request, pk=None):
        instance = self.service.get_by_id(pk)
        new_status = request.data.get('status')
        if new_status in ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'LOCKED']:
            instance.status = new_status
            instance.save(update_fields=['status'])
            return self.success_response({"status": new_status}, "Statut modifié avec succès.", status.HTTP_200_OK)
        return Response({"error": "Statut invalide"}, status=status.HTTP_400_BAD_REQUEST)
