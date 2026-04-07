from django.contrib import admin
from django.urls import path, re_path, include
from django.views.generic import TemplateView
from django.views.decorators.csrf import csrf_exempt

# Nos Contrôleurs
from apps.core.api.controllers.RouterController import RouterView
# --- CORRECTION : On importe NOTRE contrôleur personnalisé ---
from apps.core.api.controllers.GraphQlController import GraphQLController 

# Authentification JWT
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # 1. Admin Django
    path('admin/', admin.site.urls),
    path('api/', include('apps.core.api.urls')),

    # 2. Authentification (Publique)
    # L'exemption CSRF est nécessaire pour les APIs JWT car on n'utilise pas encore de session/cookie
    path('api/auth/login/', csrf_exempt(TokenObtainPairView.as_view()), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # 3. API CUD (REST - Écriture)
    path("api/<str:model_name>/<str:method_name>/", RouterView.as_view(), name="api_router"),
    path("api/<str:model_name>/<str:method_name>/<int:pk>/", RouterView.as_view(), name="api_router_pk"),
    
    # 4. API READ (GraphQL - Lecture)
    # --- CORRECTION : On utilise GraphQLController ---
    # Il gère la sécurité JWT et désactive le CSRF automatiquement
    re_path(r'^graphql.*', GraphQLController.as_view(graphiql=True)),
    
    # 5. Frontend Angular (Maquette/App)
    path('', TemplateView.as_view(template_name='index.html'), name='index'),
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)