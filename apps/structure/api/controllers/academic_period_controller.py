from apps.core.api.controllers.BaseController import BaseController
from ..serializers.academic_period_serializer import AcademicPeriodSerializer
from ...services.academic_period_service import AcademicPeriodService
from rest_framework.response import Response
from rest_framework import status


class AcademicPeriodController(BaseController):
    serializer_class = AcademicPeriodSerializer
    service_class = AcademicPeriodService

    def close(self, request, pk, *args, **kwargs):
        """ Clôture manuelle d'une période académique """
        self.check_membership_permissions(request, 'change')
        try:
            result = self.service.close(pk)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
        data = self.get_serializer_instance(result).data
        return self.success_response(data, "Période clôturée avec succès.", status.HTTP_200_OK)

    def reopen(self, request, pk, *args, **kwargs):
        """ Réouverture d'une période académique """
        self.check_membership_permissions(request, 'change')
        try:
            result = self.service.reopen(pk)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
        data = self.get_serializer_instance(result).data
        return self.success_response(data, "Période réouverte avec succès.", status.HTTP_200_OK)
