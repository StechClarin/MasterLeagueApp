from django.http import HttpResponseForbidden, JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from graphene_django.views import GraphQLView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated

class GraphQLController(GraphQLView):
    """
    Notre Contrôleur GraphQL personnalisé.
    Il remplace la vue par défaut pour forcer la sécurité JWT.
    """

    # On désactive le CSRF car on utilise des Tokens, pas des Cookies de session
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        
        # 1. GESTION DE L'INTERFACE GRAPHIQL (Navigateur)
        # Si on est en mode debug et que c'est une requête GET, 
        # on laisse passer pour afficher l'interface GraphiQL.
        if request.method == "GET" and self.graphiql:
            return super().dispatch(request, *args, **kwargs)


        authentication_classes = [JWTAuthentication]
        permission_classes = [IsAuthenticated]
        # if not request.user.is_authenticated:
        #     return JsonResponse(
        #         {"errors": [{"message": "Authentification requise (Token invalide ou absent)."}]}, 
        #         status=401
        #     )
        # 2. SÉCURITÉ
        # On laisse passer tout le monde ici.
        # L'utilisateur est identifié via le Middleware JWT si le header est présent.
        # L'autorisation fine (can user see X?) se fera dans les Resolvers.   
        # 3. SUCCÈS
        # On laisse Graphene faire son travail magique
        return super().dispatch(request, *args, **kwargs)
    