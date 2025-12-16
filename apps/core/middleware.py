from django.utils.functional import SimpleLazyObject
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed

class JWTMiddleware:
    """
    Middleware personnalisé pour injecter l'utilisateur JWT dans la requête Django.
    Indispensable pour que Graphene (GraphQL) connaisse l'utilisateur connecté via un Token.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # On utilise SimpleLazyObject pour ne décoder le token que si on accède à request.user
        # Cela évite de ralentir les requêtes qui n'ont pas besoin d'auth.
        request.user = SimpleLazyObject(lambda: self.get_jwt_user(request))
        return self.get_response(request)

    def get_jwt_user(self, request):
        """
        Tente de récupérer l'utilisateur depuis le Header Authorization (Bearer Token).
        Si échec, retombe sur l'authentification standard (Session).
        """
        
        # 1. Vérification rapide : Y a-t-il un header Authorization ?
        header = request.META.get('HTTP_AUTHORIZATION', None)
        if header is None:
            # Pas de token, on laisse Django gérer (Session ou Anonymous)
            from django.contrib.auth.middleware import get_user
            return get_user(request)

        # 2. Tentative d'authentification JWT
        auth = JWTAuthentication()
        
        try:
            # authenticate() retourne un tuple (User, Token) ou None
            result = auth.authenticate(request)
            
            if result is not None:
                user, token = result
                # Succès ! On retourne l'utilisateur du token
                return user
            
        except (InvalidToken, AuthenticationFailed) as e:
            # Le token est présent mais invalide (expiré, mauvaise signature...)
            # On peut logger l'erreur ici si besoin : print(f"JWT Error: {e}")
            pass
        except Exception as e:
            # Erreur inattendue
            # print(f"JWT Unexpected Error: {e}")
            pass

        # 3. Fallback final : Si le token est invalide, on renvoie AnonymousUser
        # ou l'utilisateur de session s'il existe (cas rare de double auth)
        from django.contrib.auth.middleware import get_user
        return get_user(request)

class EstablishmentMiddleware:
    """
    Middleware pour extraire l'ID de l'établissement du Header custom.
    X-Establishment-ID -> request.establishment_id
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Utilisation de request.headers (plus robuste et insensible à la casse)
        # Le header envoyé est 'X-Establishment-ID'
        est_id = request.headers.get('x-establishment-id') or request.headers.get('X-Establishment-ID')
        
        # On stocke l'ID dans la request pour l'utiliser plus tard (Contrôleurs, Services)
        # On peut aussi valider si l'ID est un entier ou existe, mais restons légers ici.
        request.establishment_id = est_id if est_id else None
        
        return self.get_response(request)