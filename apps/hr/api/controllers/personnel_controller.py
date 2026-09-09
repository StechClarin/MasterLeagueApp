from apps.core.api.controllers.BaseController import BaseController
from ..serializers.personnel_serializer import PersonnelSerializer
from ...services.personnel_service import PersonnelService

class PersonnelController(BaseController):
    serializer_class = PersonnelSerializer
    service_class = PersonnelService

    def upload_contract(self, request, pk=None):
        """
        Import du contrat signé (scan) en multipart/form-data :
        champ fichier attendu : 'contract_file'.
        URL : POST /api/personnel/upload_contract/{uuid}/
        """
        from rest_framework import status

        if not pk:
            return self.error_response("L'identifiant du personnel est requis.", status.HTTP_400_BAD_REQUEST)

        instance = self.service.get_by_id(pk)

        # Vérification Permission : CHANGE
        self.check_membership_permissions(request, 'change')

        file_obj = request.FILES.get('contract_file')
        if not file_obj:
            return self.error_response("Aucun fichier 'contract_file' fourni.", status.HTTP_400_BAD_REQUEST)

        instance.contract_file = file_obj
        instance.save(update_fields=['contract_file', 'updated_at'])

        data = self.get_read_serializer_instance(instance).data
        return self.success_response(data, "Contrat signé importé avec succès.", status.HTTP_200_OK)
