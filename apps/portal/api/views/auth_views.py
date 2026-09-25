from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.parsers import JSONParser
from rest_framework.response import Response

from ...services.portal_auth_service import (
    PortalAuthError,
    AlreadyRequestedError,
    request_otp,
    verify_otp,
    authenticate_manager_password,
)


class PortalAuthRequestView(APIView):
    """
    POST /api/portal/auth/request/
    Body : {"space": "student" | "prof", "contact": "email ou téléphone"}
    """
    authentication_classes = []
    permission_classes = [AllowAny]
    parser_classes = [JSONParser]

    def post(self, request):
        try:
            data = request.data or {}
            space = str(data.get("space", "")).strip().lower()
            contact = str(data.get("contact", "")).strip()
            payload = request_otp(space, contact)
        except AlreadyRequestedError as exc:
            return Response({"detail": exc.detail}, status=exc.status)
        except PortalAuthError as exc:
            return Response({"detail": exc.detail}, status=exc.status)
        return Response(payload, status=200)


class PortalAuthVerifyView(APIView):
    """
    POST /api/portal/auth/verify/
    Body : {"space": "student" | "prof", "contact": "...", "code": "123456"}
    Réponse : access_token (JWT Eteyelo Portal), person, children, space.
    """
    authentication_classes = []
    permission_classes = [AllowAny]
    parser_classes = [JSONParser]

    def post(self, request):
        try:
            data = request.data or {}
            space = str(data.get("space", "")).strip().lower()
            contact = str(data.get("contact", "")).strip()
            code = str(data.get("code", "")).strip()
            token, context = verify_otp(space, contact, code)
        except PortalAuthError as exc:
            return Response({"detail": exc.detail}, status=exc.status)

        return Response(
            {
                **token,
                "space": context["space"],
                "person": context["person"],
                "children": context["children"],
            },
            status=200,
        )


class PortalManagerLoginView(APIView):
    """
    POST /api/portal/auth/manager-login/
    Body : {"username": "email ou nom d'utilisateur", "password": "..."}
    Authentification Django classique par mot de passe.
    """
    authentication_classes = []
    permission_classes = [AllowAny]
    parser_classes = [JSONParser]

    def post(self, request):
        try:
            data = request.data or {}
            username = str(data.get("username", "")).strip()
            password = str(data.get("password", "")).strip()
            token, context = authenticate_manager_password(username, password)
        except PortalAuthError as exc:
            return Response({"detail": exc.detail}, status=exc.status)

        return Response(
            {
                **token,
                "space": context["space"],
                "person": context["person"],
                "children": context["children"],
            },
            status=200,
        )


class PortalEstablishmentsListView(APIView):
    """
    GET /api/portal/auth/establishments/
    Liste des établissements actifs pour la sélection multisite.
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        from apps.core.models.establishment import Establishment
        ests = Establishment.objects.all().order_by("name")
        data = [
            {
                "id": str(e.pk),
                "name": e.name,
                "code": e.code or "",
                "city": e.city or "",
            }
            for e in ests
        ]
        return Response({"establishments": data}, status=200)


