from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from strawberry.django.views import GraphQLView
from rest_framework_simplejwt.authentication import JWTAuthentication
from apps.core.graphql.schema import schema

class GraphQLController(GraphQLView):
    """
    Notre Contrôleur GraphQL personnalisé pour Strawberry.
    Il remplace la vue par défaut pour forcer la sécurité JWT.
    """
    schema = schema

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        # Authentification JWT silencieuse si l'en-tête Authorization est présent
        try:
            authenticator = JWTAuthentication()
            auth_result = authenticator.authenticate(request)
            if auth_result:
                request.user, request.auth = auth_result
        except Exception:
            pass

        return super().dispatch(request, *args, **kwargs)
    