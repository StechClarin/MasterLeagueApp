# apps/core/api/views/unlockedmod.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
from apps.core.models import Establishment, TenantLicense

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
        tenant_id = request.data.get('tenant_id')
        module_code = request.data.get('module_code')
        is_active = request.data.get('is_active', True)

        if not tenant_id or not module_code:
            return Response({"error": "Missing required fields (tenant_id, module_code)"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 3. Récupération du Tenant (Establishment) par son code
            establishment = Establishment.objects.get(code=tenant_id)

            # 4. Enregistrement de la licence (Ajout ou mise à jour)
            license, created = TenantLicense.objects.update_or_create(
                establishment=establishment,
                module_code=module_code,
                defaults={'is_active': is_active}
            )

            status_str = "unlocked" if is_active else "revoked"
            return Response({
                "status": "success",
                "message": f"Module '{module_code}' {status_str} for tenant '{tenant_id}'."
            }, status=status.HTTP_200_OK)

        except Establishment.DoesNotExist:
            return Response({"error": f"Tenant '{tenant_id}' not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
