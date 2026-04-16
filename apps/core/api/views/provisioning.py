from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.core.services.provisioning_service import ProvisioningService
import os

class ProvisionTenantView(APIView):
    """
    BRIDGE "DOUBLE LOCK" - ETHER NANOS HUB
    --------------------------------------
    Cet endpoint est la porte d'entrée de School Manage pour le Hub / Admin Store.
    Il délègue désormais la logique métier au ProvisioningService.
    """
    authentication_classes = [] 
    permission_classes = []     

    def post(self, request, *args, **kwargs):
        # 1. Vérification de la clé API (Couche Transport/Sécurité)
        api_key = request.headers.get('X-Hub-Api-Key')
        expected_key = os.environ.get('HUB_API_KEY', 'ethernanos-hub-secret-2026')
        
        if not api_key or api_key != expected_key:
            return Response({"error": "Unauthorized: Invalid API Key"}, status=status.HTTP_401_UNAUTHORIZED)

        # 2. Récupération et validation basique des données
        tenant_id = request.data.get('tenant_id')
        tenant_name = request.data.get('tenant_name')
        admin_email = request.data.get('admin_email')
        hub_id = request.data.get('hub_id')

        if not tenant_id or not tenant_name:
            return Response({"error": "Missing required fields (tenant_id, tenant_name)"}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Délégation au Service (Couche Métier)
        try:
            result = ProvisioningService.provision_tenant(
                tenant_id=tenant_id,
                tenant_name=tenant_name,
                hub_id=hub_id,
                admin_email=admin_email
            )
            
            return Response(result, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
