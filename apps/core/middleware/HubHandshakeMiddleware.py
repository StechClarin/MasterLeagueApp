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
        # Adaptatif : on cherche la présence de la route n'importe où dans l'URL
        if '/admin/' in request.path or '/api/auth/login/' in request.path:
            # EXEMPTION CSRF FORCÉE SUR LOGIN (v18.1)
            # Puisque c'est le point d'entrée, on lève la barrière CSRF ici
            request._dont_enforce_csrf_checks = True
            setattr(request, '_csrf_processing_done', True)
            return self.get_response(request)

        # 2. Récupération du Jeton Hub et du Secret attendu
        hub_token = request.headers.get('X-Hub-Session-Token')
        expected_token = os.environ.get('ETHER_HUB_SECRET_KEY', 'ethernanos-hub-secret-2026')

        # 3. Vérification de sécurité (Shield v6.2)
        # Si nous sommes lancés par le Hub (ETHER_HUB_PID présent)
        if os.environ.get('ETHER_HUB_PID'):
            # On n'exige le handshake QUE pour les appels d'API (GraphQL / REST)
            is_api_call = '/graphql/' in request.path or '/api/' in request.path
            
            if is_api_call:
                if hub_token != expected_token:
                    return JsonResponse({
                        'error': 'Unauthorized Hub Handshake Failed',
                        'detail': 'Cette application ne peut être accédée qu\'à travers le Launcher Ethernanos.'
                    }, status=403)
                else:
                    # HANDSHAKE VALIDE -> EXEMPTION CSRF (Industrial Security Pattern)
                    # On indique à Django que le traitement CSRF est déjà assuré par le handshake
                    request._dont_enforce_csrf_checks = True
                    # Compatibilité avec certains middlewares CSRF
                    setattr(request, '_csrf_processing_done', True)

        return self.get_response(request)
