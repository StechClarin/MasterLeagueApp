from django.contrib import admin
from django.urls import path, re_path, include
from django.views.generic import TemplateView
from django.views.decorators.csrf import csrf_exempt

# Nos Contrôleurs
from apps.core.api.controllers.RouterController import RouterView
# --- CORRECTION : On importe NOTRE contrôleur personnalisé ---
from apps.core.api.controllers.GraphQlController import GraphQLController 

# Authentification JWT
from apps.profilmanagement.api.views.custom_jwt_view import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # 1. Admin Django
    path('admin/', admin.site.urls),
    path('api/', include('apps.core.api.urls')),

    # 2. Authentification (Publique)
    # L'exemption CSRF est nécessaire pour les APIs JWT car on n'utilise pas encore de session/cookie
    path('api/auth/login/', csrf_exempt(CustomTokenObtainPairView.as_view()), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # 3. API CUD (REST - Écriture)
    path("api/<str:model_name>/<str:method_name>/", csrf_exempt(RouterView.as_view()), name="api_router"),
    path("api/<str:model_name>/<str:method_name>/<int:pk>/", csrf_exempt(RouterView.as_view()), name="api_router_pk"),
    path("api/<str:model_name>/<str:method_name>/<uuid:pk>/", csrf_exempt(RouterView.as_view()), name="api_router_uuid"),
    
    # 4. API READ (GraphQL - Lecture)
    # --- CORRECTION : On utilise GraphQLController ---
    # Il gère la sécurité JWT et désactive le CSRF automatiquement
    re_path(r'^graphql.*', GraphQLController.as_view(graphiql=True)),
]

from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
import os

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # On production (VPS), we can serve media through Django if Nginx is not configured
    # This is useful for the initial setup and Hub sync visibility.
    urlpatterns += [
        path('media/<path:path>', serve, {'document_root': settings.MEDIA_ROOT}),
    ]

# 5. Frontend Angular (Maquette/App) - MUST BE LAST
urlpatterns += [
    path('', TemplateView.as_view(template_name='index.html'), name='index'),
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]