from django.utils.functional import SimpleLazyObject
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed

# Import du Handshake depuis son propre fichier
from .HubHandshakeMiddleware import HubHandshakeMiddleware

class JWTMiddleware:
    """
    Middleware personnalisé pour injecter l'utilisateur JWT dans la requête Django.
    Indispensable pour que Graphene (GraphQL) connaisse l'utilisateur connecté via un Token.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.user = SimpleLazyObject(lambda: self.get_jwt_user(request))
        return self.get_response(request)

    def get_jwt_user(self, request):
        header = request.META.get('HTTP_AUTHORIZATION', None)
        if header is None:
            from django.contrib.auth.middleware import get_user
            return get_user(request)

        auth = JWTAuthentication()
        try:
            result = auth.authenticate(request)
            if result is not None:
                user, token = result
                return user
        except (InvalidToken, AuthenticationFailed):
            pass
        except Exception:
            pass

        from django.contrib.auth.middleware import get_user
        return get_user(request)

class EstablishmentMiddleware:
    """
    Middleware pour extraire et valider l'ID de l'établissement du Header custom.
    X-Establishment-ID -> request.establishment_id
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        est_id = request.headers.get('x-establishment-id') or request.headers.get('X-Establishment-ID')
        
        # Sécurité : Si l'utilisateur est connecté, on vérifie qu'il a le droit d'être là
        if est_id and request.user.is_authenticated and not request.user.is_superuser:
            from apps.core.models.establishment_membership import EstablishmentMembership
            from django.core.exceptions import ValidationError
            
            try:
                # On vérifie l'existence d'un membership actif
                exists = EstablishmentMembership.objects.filter(
                    user=request.user, 
                    establishment_id=est_id,
                    status='active'
                ).exists()
                
                if not exists:
                    # Si pas de membership, on ignore le header (empêche le "hop" entre établissements)
                    est_id = None
            except (ValidationError, ValueError):
                # ID malformé -> On ignore
                est_id = None

        request.establishment_id = est_id if est_id else None
        return self.get_response(request)
