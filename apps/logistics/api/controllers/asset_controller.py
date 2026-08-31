from rest_framework.response import Response
from rest_framework import status
from apps.core.api.controllers.BaseController import BaseController
from ..serializers.asset_serializer import AssetSerializer
from ..serializers.maintenance_serializer import MaintenanceSerializer
from ...services.asset_service import AssetService

class AssetController(BaseController):
    serializer_class = AssetSerializer
    service_class = AssetService

    def report_issue(self, request, pk, *args, **kwargs):
        """ Déclare un incident / panne sur un équipement """
        self.check_membership_permissions(request, 'change')
        description = request.data.get('description', '')
        if not description:
            return Response({"detail": "La description de la panne est obligatoire."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            result = self.service.report_issue(pk, description)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        data = self.get_serializer_instance(result).data
        return self.success_response(data, "Panne signalée avec succès. Statut mis à jour.", status.HTTP_200_OK)

    def perform_maintenance(self, request, pk, *args, **kwargs):
        """ Enregistre les travaux de maintenance effectués """
        self.check_membership_permissions(request, 'change')
        description = request.data.get('description', '')
        if not description:
            return Response({"detail": "La description des opérations de maintenance est obligatoire."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            record = self.service.perform_maintenance(pk, description)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # On sérialise le rapport de maintenance créé pour renvoyer son ID
        serializer = MaintenanceSerializer(record, context={'request': request})
        return self.success_response(serializer.data, "Rapport de maintenance enregistré avec succès. Matériel disponible.", status.HTTP_200_OK)

    def assign(self, request, pk, *args, **kwargs):
        """ Assigne l'équipement à un local """
        self.check_membership_permissions(request, 'change')
        room_id = request.data.get('room_id')
        if not room_id:
            return Response({"detail": "Le local d'affectation (room_id) est requis."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            result = self.service.assign(pk, room_id)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        data = self.get_serializer_instance(result).data
        return self.success_response(data, "Équipement affecté au local avec succès.", status.HTTP_200_OK)

    def unassign(self, request, pk, *args, **kwargs):
        """ Désaffecte / libère l'équipement """
        self.check_membership_permissions(request, 'change')
        try:
            result = self.service.unassign(pk)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        data = self.get_serializer_instance(result).data
        return self.success_response(data, "Équipement libéré de son affectation.", status.HTTP_200_OK)

    def retire(self, request, pk, *args, **kwargs):
        """ Met au rebut l'équipement """
        self.check_membership_permissions(request, 'change')
        try:
            result = self.service.retire(pk)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        data = self.get_serializer_instance(result).data
        return self.success_response(data, "Équipement mis au rebut.", status.HTTP_200_OK)
