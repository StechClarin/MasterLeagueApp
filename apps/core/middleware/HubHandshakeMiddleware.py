import os
import logging

from django.http import JsonResponse

logger = logging.getLogger(__name__)

class HubHandshakeMiddleware:
    """
    Bouclier Industriel (v6.5) - Handshake Hub & Bypass CSRF adaptatif.
    Détecte le Launcher Ethernanos et sécurise les échanges via ETHER_SESSION_TOKEN.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 1. IDENTIFICATION : Est-on lancé par le Hub ?
        is_hub_mode = os.environ.get('ETHER_HUB_PID') is not None

        # 2. EXEMPTIONS CRITIQUES (Login & Admin)
        # Adaptatif : on supporte les préfixes de production
        if '/api/auth/login/' in request.path_info or '/admin/' in request.path_info:
            logger.debug("[HUB] CSRF BYPASS for public route: %s", request.path_info)
            return self.bypass_csrf(request)

        if is_hub_mode:
            # 3. RÉCUPÉRATION DES JETONS
            # On utilise le jeton de session dynamique généré par Rust
            hub_token = request.headers.get('X-Hub-Session-Token')
            expected_token = os.environ.get('ETHER_SESSION_TOKEN')

            # 4. NORMALISATION DES CHEMINS HUB
            effective_path = request.path_info
            prefix = os.environ.get('ETHER_APP_PREFIX', '')
            if prefix and effective_path.startswith(prefix):
                effective_path = effective_path[len(prefix):] or '/'

            # 5. SÉCURISATION API & GRAPHQL
            if effective_path.startswith('/api/external/'):
                # Les endpoints /api/external/* ont leur propre sécurité via X-Hub-Api-Key.
                return self.get_response(request)

            if request.method == 'OPTIONS':
                # Autorise les préflights CORS sans jeton de session.
                # Le header X-Hub-Session-Token sera vérifié sur la requête réelle.
                return self.bypass_csrf(request)

            if '/api/' in effective_path or effective_path.startswith('/graphql'):
                if not hub_token or hub_token != expected_token:
                    logger.warning(
                        "[HUB] Handshake FAILED: path=%s, token=%s, expected=%s",
                        request.path_info,
                        'PRESENT' if hub_token else 'MISSING',
                        'SET' if expected_token else 'NONE',
                    )
                    return JsonResponse({
                        'error': 'Unauthorized Hub Handshake Failed',
                        'detail': 'Access denied: Invalid or missing Hub Session Token.'
                    }, status=403)
                logger.debug("[HUB] Handshake OK: path=%s", request.path_info)
                # Handshake Validé -> Immunité CSRF automatique
                return self.bypass_csrf(request)

        return self.get_response(request)

    def bypass_csrf(self, request):
        """Force Django à ignorer la vérification CSRF pour cette requête."""
        setattr(request, '_dont_enforce_csrf_checks', True)
        # Compatibilité avec certains middlewares tiers
        setattr(request, '_csrf_processing_done', True)
        return self.get_response(request)
