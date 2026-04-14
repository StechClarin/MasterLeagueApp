from .settings_base import *

# --- CONFIGURATION HUB INDUSTRIEL (v7.2) ---
# Ce fichier est activé lors du push / empaquetage du Hub.
DEBUG = env.bool('DEBUG', default=False)

# 1. SÉCURITÉ PURE JWT (Pas de sessions sur l'API)
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        # 'rest_framework.authentication.SessionAuthentication', # <--- DÉSACTIVÉ en mode Hub
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# 2. HANDSHAKE HUB & MIDDLEWARE
MIDDLEWARE = [
    'apps.core.middleware.HubHandshakeMiddleware', # <--- HANDSHAKE HUB OBLIGATOIRE
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware', 
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'apps.core.middleware.JWTMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.core.middleware.EstablishmentMiddleware',
]

# 3. RÉGLAGES IFRAME & CSRF
# Indispensable car le Webview2 bloque les cookies tiers
CSRF_USE_SESSIONS = True
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False

X_FRAME_OPTIONS = 'ALLOWALL'

# 4. CORS CONFIGURATION (Point de Confiance)
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

from corsheaders.defaults import default_headers
CORS_ALLOW_HEADERS = list(default_headers) + [
    'X-Hub-Session-Token',
    'X-Hub-Launch-Token',
    'X-Tenant-Id',
]
CORS_EXPOSE_HEADERS = ['Content-Type', 'X-CSRFToken']

# 5. ORIGINES DE CONFIANCE HUB
CSRF_TRUSTED_ORIGINS = env.list('CSRF_TRUSTED_ORIGINS', default=[
    "http://localhost:1420",  # Tauri Dev Host
    "http://127.0.0.1:1420",
    "tauri://localhost",      # Tauri Production Host
    "http://127.0.0.1:8000",
    "http://localhost:8000",
    "http://localhost:4200",  # Angular Dev Host
    "http://127.0.0.1:4200",
])
