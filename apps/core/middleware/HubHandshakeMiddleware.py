import os
from django.http import JsonResponse

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
        if '/api/auth/login/' in request.path or '/admin/' in request.path:
            print(f"[HUB] CSRF BYPASS for public route: {request.path}")
            return self.bypass_csrf(request)

        if is_hub_mode:
            # 3. RÉCUPÉRATION DES JETONS
            # On utilise le jeton de session dynamique généré par Rust
            hub_token = request.headers.get('X-Hub-Session-Token')
            expected_token = os.environ.get('ETHER_SESSION_TOKEN')

            # 4. SÉCURISATION API & GRAPHQL
            if '/api/' in request.path or '/graphql/' in request.path:
                if not hub_token or hub_token != expected_token:
                    print(f"[HUB] Handshake FAILED: path={request.path}, token={hub_token}, expected={'SET' if expected_token else 'NONE'}")
                    return JsonResponse({
                        'error': 'Unauthorized Hub Handshake Failed',
                        'detail': 'Access denied: Invalid or missing Hub Session Token.'
                    }, status=403)
                print(f"[HUB] Handshake OK: path={request.path}")
                # Handshake Validé -> Immunité CSRF automatique
                return self.bypass_csrf(request)

        return self.get_response(request)

    def bypass_csrf(self, request):
        """Force Django à ignorer la vérification CSRF pour cette requête."""
        setattr(request, '_dont_enforce_csrf_checks', True)
        # Compatibilité avec certains middlewares tiers
        setattr(request, '_csrf_processing_done', True)
        return self.get_response(request)
