# apps/core/api/views/unlockedmod.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
from apps.core.models import Establishment, TenantLicense
from apps.profilmanagement.models import User

class UnlockModuleView(APIView):
    """
    ENDPOINT DE LICENSING - PROJECT STORE
    ------------------------------------
    Permet au Store d'activer ou de révoquer un module pour un tenant donné.
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):
        # 1. Validation Clé de Transport Sécurisée (identique à provisioning.py)
        api_key = request.headers.get('X-Hub-Api-Key')
        expected_key = os.environ.get('HUB_API_KEY', 'ethernanos-hub-secret-2026')
        
        if not api_key or api_key != expected_key:
            return Response({"error": "Unauthorized: Invalid API Key"}, status=status.HTTP_401_UNAUTHORIZED)

        # 2. Récupération et validation basique des paramètres
        hub_id_from_payload = request.data.get('hub_id')
        if not hub_id_from_payload:
            # Fallback for older frontend payload
            hub_id_from_payload = request.data.get('tenant_id')

        module_code = request.data.get('module_code')
        is_active = request.data.get('is_active', True)

        if not hub_id_from_payload or not module_code:
            return Response({"error": "Missing required fields (hub_id, module_code)"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 3. Récupération de l'Utilisateur (Propriétaire) via le hub_id
            try:
                owner = User.objects.get(hub_id=hub_id_from_payload)
            except User.DoesNotExist:
                return Response({"error": f"Owner with hub_id '{hub_id_from_payload}' not found"}, status=status.HTTP_404_NOT_FOUND)

            # 4. Enregistrement de la licence (Ajout ou mise à jour) pour l'Utilisateur
            TenantLicense.objects.update_or_create(
                user=owner,
                module_code=module_code,
                defaults={'is_active': is_active}
            )

            status_str = "unlocked" if is_active else "revoked"
            return Response({
                "status": "success",
                "message": f"Module '{module_code}' {status_str} for user '{owner.username}'."
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
