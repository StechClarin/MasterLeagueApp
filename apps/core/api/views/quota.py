# apps/core/api/views/quota.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os
from django.core.exceptions import ObjectDoesNotExist
from apps.core.models import TenantQuota
from apps.profilmanagement.models import User

class UpdateQuotaView(APIView):
    """
    ENDPOINT DE GESTION DU QUOTA D'UTILISATEURS (PAY-PER-SEAT)
    ----------------------------------------------------------
    Permet au Store d'augmenter ou mettre à jour le quota de comptes
    personnel/utilisateurs autorisés pour un owner donné.
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):
        api_key = request.headers.get('X-Hub-Api-Key')
        expected_key = os.environ.get('HUB_API_KEY', 'ethernanos-hub-secret-2026')

        if not api_key or api_key != expected_key:
            return Response({"error": "Unauthorized: Invalid API Key"}, status=status.HTTP_401_UNAUTHORIZED)

        hub_id = request.data.get('hub_id') or request.data.get('tenant_id')
        if not hub_id:
            return Response({"error": "Missing 'hub_id' parameter"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            owner = User.objects.get(hub_id=hub_id)
        except ObjectDoesNotExist:
            return Response({"error": f"Owner with hub_id '{hub_id}' not found"}, status=status.HTTP_404_NOT_FOUND)

        quota, _ = TenantQuota.objects.get_or_create(user=owner)

        # Mode 1 : Ajout d'utilisateurs (+N)
        additional_seats = request.data.get('additional_seats')
        if additional_seats is not None:
            quota.max_users += int(additional_seats)

        # Mode 2 : Définition directe de max_users
        max_users = request.data.get('max_users')
        if max_users is not None:
            quota.max_users = int(max_users)

        # Optionnel : mise à jour du quota max_students
        max_students = request.data.get('max_students')
        if max_students is not None:
            quota.max_students = int(max_students)

        quota.save()

        return Response({
            "status": "success",
            "hub_id": hub_id,
            "max_users": quota.max_users,
            "current_staff_users": quota.current_staff_users_count(),
            "max_students": quota.max_students
        }, status=status.HTTP_200_OK)
