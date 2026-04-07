from .settings_base import *

# --- CONFIGURATION DÉVELOPPEMENT NAVIGATEUR (v7.1) ---
DEBUG = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication', # <--- ACTIVÉ en Dev pour le navigateur
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

MIDDLEWARE = [
    'apps.core.middleware.HubHandshakeMiddleware.HubHandshakeMiddleware', # <--- BOUCLIER HUB (v17.5)
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

# --- RÉGLAGES CORS DÉVELOPPEMENT ---
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

from corsheaders.defaults import default_headers
CORS_ALLOW_HEADERS = list(default_headers) + [
    'x-establishment-id',
    'x-hub-launch-token',
    'X-Hub-Session-Token', # <--- AJOUTÉ pour le confort Dev (v9.1)
]

# CSRF standard pour le développement
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:4200", # Angular Dev
    "http://127.0.0.1:4200",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# On garde les sessions standard (cookies) pour le confort du navigateur
CSRF_USE_SESSIONS = False 
X_FRAME_OPTIONS = 'SAMEORIGIN'