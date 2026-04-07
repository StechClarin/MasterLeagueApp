import os

class HubPrefixMiddleware:
    """
    Nettoyeur de Préfixe Industriel (v23.1).
    Synchronise PATH_INFO et SCRIPT_NAME pour que Django reconnaisse les routes 
    même derrière un préfixe dynamique (ex: /schoolmanage/test/).
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 1. On récupère le préfixe attendu (injecté par manage.py)
        prefix = os.environ.get('ETHER_APP_PREFIX')
        
        if prefix:
            path = request.path_info
            
            # 2. Si l'URL reçue commence par le préfixe, on nettoie le chemin de routage
            if path.startswith(prefix):
                # On retire le préfixe pour le routing interne de Django
                # /schoolmanage/test/api/login -> /api/login
                new_path = path[len(prefix):]
                if not new_path.startswith('/'):
                    new_path = '/' + new_path
                
                # Mise à jour critique pour le Resolver de Django
                request.path_info = new_path
                
                # On s'assure que SCRIPT_NAME est bien synchronisé
                request.environ['SCRIPT_NAME'] = prefix.rstrip('/')

        return self.get_response(request)
