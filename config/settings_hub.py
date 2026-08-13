from .settings_base import *

import logging
from django.core.exceptions import ImproperlyConfigured

# --- CONFIGURATION HUB INDUSTRIEL (v7.2) ---
# Ce fichier est activé lors du push / empaquetage du Hub.
DEBUG = env.bool('DEBUG', default=False)

# --- SÉCURITÉ : SECRET_KEY OBLIGATOIRE EN PRODUCTION ---
# On refuse le fallback 'django-insecure-...' de settings_base en mode Hub.
if not env('SECRET_KEY', default=None):
    raise ImproperlyConfigured(
        "[settings_hub] SECRET_KEY est obligatoire en mode Hub. "
        "Définissez-le dans .env ou transmettez-le via le Launcher."
    )

# --- SYNCHRONISATION DES CHEMINS HUB ---
FORCE_SCRIPT_NAME = os.environ.get('ETHER_APP_PREFIX', None)
if FORCE_SCRIPT_NAME:
    logging.getLogger(__name__).info("ROUTING: Hub settings anchored to prefix '%s'", FORCE_SCRIPT_NAME)

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
# ORDRE CRITIQUE : JWTMiddleware injecte request.user, EstablishmentMiddleware injecte
# request.establishment_id, et LicenseMiddleware dépend des DEUX.
# => JWT et Establishment DOIVENT précéder License. Ne pas réordonner sans lancer les tests.
MIDDLEWARE = [
    'apps.core.middleware.HubPrefixMiddleware.HubPrefixMiddleware',
    'corsheaders.middleware.CorsMiddleware', 
    'apps.core.middleware.HubHandshakeMiddleware.HubHandshakeMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'apps.core.middleware.JWTMiddleware',
    'apps.core.middleware.EstablishmentMiddleware',
    'apps.core.middleware.LicenseMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
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
    'X-Hub-Api-Key',
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
