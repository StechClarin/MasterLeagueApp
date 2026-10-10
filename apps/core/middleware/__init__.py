from django.utils.functional import SimpleLazyObject
from django.contrib.auth.models import AnonymousUser
from django.db import models
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

        # [FIX v1.0] Validation du format UUID pour TOUS les utilisateurs (y compris superusers).
        # Un X-Establishment-ID malformé provoquait une erreur 500 (ValidationError) lors des
        # filtres de queryset dans les controllers/services REST.
        if est_id:
            try:
                import uuid
                uuid.UUID(str(est_id))
            except (ValueError, TypeError):
                est_id = None

        # Sécurité : Si l'utilisateur est connecté, on vérifie qu'il a le droit d'être là
        if est_id and request.user.is_authenticated and not request.user.is_superuser:
            from apps.core.models.establishment_membership import EstablishmentMembership
            from apps.core.models.establishment import Establishment
            from django.core.exceptions import ValidationError
            
            try:
                # On vérifie si l'utilisateur est soit propriétaire soit membre actif
                is_owner = Establishment.objects.filter(id=est_id, user=request.user).exists()
                is_member = EstablishmentMembership.objects.filter(
                    user=request.user, 
                    establishment_id=est_id,
                    status='active'
                ).exists()
                
                if not (is_owner or is_member):
                    est_id = None
            except (ValidationError, ValueError):
                # ID malformé -> On ignore
                est_id = None

        # Fallback automatique si aucun header fourni mais utilisateur connecté
        if not est_id and request.user.is_authenticated:
            try:
                from apps.core.models.establishment import Establishment
                user_est = Establishment.objects.filter(user=request.user).first()
                if user_est:
                    est_id = str(user_est.id)
                else:
                    from apps.core.models.establishment_membership import EstablishmentMembership
                    mem = EstablishmentMembership.objects.filter(user=request.user, status='active').first()
                    if mem:
                        est_id = str(mem.establishment_id)
            except Exception:
                pass

        request.establishment_id = est_id if est_id else None
        return self.get_response(request)

class LicenseMiddleware:
    """
    Bouclier de Licence : Empêche l'accès aux URLs appartenant à un module
    qui n'est pas débloqué (is_active=False).
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 1. On ignore les super-utilisateurs (Support technique)
        if request.user.is_superuser:
            return self.get_response(request)

        # 2. On ignore les routes système/publiques
        path = request.path
        if any(path.startswith(p) for p in ['/admin', '/graphql', '/api/auth', '/static', '/media']):
            return self.get_response(request)

        # 3. Vérification du module
        from apps.core.models import Page
        # On cherche si l'URL demandée correspond à une page enregistrée
        # Note: On utilise startswith car certaines URLs ont des IDs (ex: /students/12)
        target_page = Page.objects.select_related('module').filter(
            link__isnull=False
        ).filter(
            # On cherche une correspondance de début de chemin
            # ex: Si link est '/students', on match '/students' et '/students/add'
            models.Q(link=path) | models.Q(link__startswith=path + '/')
        ).first()

        if target_page:
            module = target_page.module
            core_codes = ['mod-referentiel', 'mod-administration']
            is_unlocked = False
            
            if module.code in core_codes:
                is_unlocked = True
            elif hasattr(request, 'establishment_id') and request.establishment_id:
                from apps.core.models import TenantLicense
                is_unlocked = TenantLicense.objects.filter(
                    establishment_id=request.establishment_id,
                    module_code=module.code,
                    is_active=True
                ).exists()
            else:
                # Fallback si pas d'établissement dans le contexte
                is_unlocked = module.is_active

            if not is_unlocked:
                from django.http import JsonResponse
                return JsonResponse({
                    "error": "LICENSE_RESTRICTION",
                    "message": f"Le module '{module.name}' n'est pas débloqué dans votre cockpit.",
                    "code": module.code
                }, status=403)

        return self.get_response(request)
