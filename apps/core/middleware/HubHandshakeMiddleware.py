import os
from django.http import JsonResponse
from django.conf import settings

class HubHandshakeMiddleware:
    """
    Middleware industriel (v6.0) garantissant que seul le Hub Launcher 
    peut communiquer avec l'application locale.
    Vérifie la présence du header 'X-Hub-Session-Token' contre la variable d'env injectée.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 1. On autorise l'admin Django et le login REST sans handshake (optionnel pour le boot)
        if request.path.startswith('/admin/') or request.path.startswith('/api/auth/login/'):
            return self.get_response(request)

        # 2. Récupération du Jeton Hub (Injecté via STDIN par le Launcher)
        # On utilise ETHER_HUB_PID ou un token dédié si présent
        hub_token = request.headers.get('X-Hub-Session-Token')
        expected_token = os.environ.get('ETHER_HUB_SECRET_KEY', 'ethernanos-hub-secret-2026')

        # 3. Vérification de sécurité (Shield v6.0)
        # Si on est dans le Hub, le token DOIT correspondre.
        if os.environ.get('ETHER_HUB_PID'):
            if hub_token != expected_token:
                return JsonResponse({
                    'error': 'Unauthorized Hub Handshake Failed',
                    'detail': 'Cette application ne peut être accédée qu\'à travers le Launcher Ethernanos.'
                }, status=403)

        return self.get_response(request)
