from django.contrib import admin
from django.urls import path, re_path

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

    # 2. Authentification (Publique)
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # 3. API CUD (REST - Écriture)
    path("api/<str:model_name>/<str:method_name>/", RouterView.as_view(), name="api_router"),
    path("api/<str:model_name>/<str:method_name>/<int:pk>/", RouterView.as_view(), name="api_router_pk"),
    
    # 4. API READ (GraphQL - Lecture)
    # --- CORRECTION : On utilise GraphQLController ---
    # Il gère la sécurité JWT et désactive le CSRF automatiquement
    re_path(r'^graphql.*', GraphQLController.as_view(graphiql=True)),
    # Force reload
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)