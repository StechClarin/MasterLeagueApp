from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from ...services.portal_auth_service import (
    PortalAuthError,
    context_from_token,
)
import jwt


class PortalSessionView(APIView):
    """
    GET /api/portal/session/
    Header : Authorization: Bearer <access_token>
    Reconstruit un contexte de session à jour (person + enfants).
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        header = request.headers.get("Authorization", "")
        if not header.lower().startswith("bearer "):
            return Response({"detail": "Jeton manquant."}, status=401)
        token = header.split(" ", 1)[1].strip()
        try:
            context = context_from_token(token)
        except jwt.ExpiredSignatureError:
            return Response({"detail": "Session expirée. Connectez-vous à nouveau."}, status=401)
        except (jwt.InvalidTokenError, PortalAuthError):
            return Response({"detail": "Jeton invalide."}, status=401)

        return Response(
            {
                "space": context["space"],
                "person": context["person"],
                "children": context["children"],
                "expires_at": context.get("claims", {}).get("exp"),
            },
            status=200,
        )
