import os
import sys
from pathlib import Path
import environ

import sys

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# --- INDUSTRIAL PATHS (v4.5 PATH REPAIR) ---
def find_industrial_path(bundle_root, target_name):
    """Recursively searches for a specific directory name up to 2 levels deep."""
    checks = [
        bundle_root / '_internal' / '_internal' / target_name,
        bundle_root / '_internal' / target_name,
        bundle_root / target_name
    ]
    for p in checks:
        if p.exists():
            return p
    return None

if getattr(sys, 'frozen', False):
    ROOT = Path(sys._MEIPASS)
    # Search targets independently because PyInstaller can split them
    found_frontend = find_industrial_path(ROOT, 'frontend_build')
    FRONTEND_DIR = found_frontend if found_frontend else (ROOT / '_internal' / 'frontend_build')
    
    # We use FRONTEND_DIR as the primary data source for EVERYTHING static
    PROJECT_DATA_DIR = found_frontend.parent if found_frontend else (ROOT / '_internal')
else:
    FRONTEND_DIR = BASE_DIR / 'frontend_build'
    PROJECT_DATA_DIR = BASE_DIR

# --- Configuration de django-environ ---
env = environ.Env(DEBUG=(bool, False))
# Now the / operator works again because PROJECT_DATA_DIR is a Path object!
env_path = PROJECT_DATA_DIR / '.env'
if env_path.exists():
    environ.Env.read_env(str(env_path))
# --- Fin de la configuration ---

SECRET_KEY = env('SECRET_KEY', default='django-insecure-ethernanos-hub-local-secret-key-2026')
DEBUG = env('DEBUG', default=False)
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['localhost', '127.0.0.1'])

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'apps.core.apps.CoreConfig',
    'apps.profilmanagement.apps.ProfilmanagementConfig',
    'apps.structure.apps.StructureConfig',   
    'apps.students.apps.StudentsConfig',
    'apps.hr.apps.HrConfig',
    'apps.pedagogy.apps.PedagogyConfig',
    'apps.documents.apps.DocumentsConfig',
    'apps.evaluations.apps.EvaluationsConfig',
    'apps.finance.apps.FinanceConfig',

    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'graphene_django', 
]

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': False,

    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'JWK_URL': None,
    'LEEWAY': 0,

    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',

    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',

    'JTI_CLAIM': 'jti',
}

MIDDLEWARE = [
    
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # Ajout WhiteNoise pour les statics
    'corsheaders.middleware.CorsMiddleware', # <--- AJOUTE CECI ICI (Très important)
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'apps.core.middleware.JWTMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.core.middleware.EstablishmentMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.normpath(str(FRONTEND_DIR)),
            os.path.normpath(str(FRONTEND_DIR)), # On unifie sur le même dossier
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

DATABASES = {
    # Default to an in-memory SQLite if DATABASE_URL is missing 
    # to avoid ImproperlyConfigured errors during analysis/check phases.
    'default': env.db('DATABASE_URL', default='sqlite:///:memory:')
}
CORS_ALLOW_ALL_ORIGINS = env.bool('CORS_ALLOW_ALL_ORIGINS', default=True)

from corsheaders.defaults import default_headers

CORS_ALLOW_HEADERS = list(default_headers) + [
    'x-establishment-id',
    'x-hub-launch-token',
]

CSRF_TRUSTED_ORIGINS = env.list('CSRF_TRUSTED_ORIGINS', default=[
    "http://localhost:4200",
    "http://127.0.0.1:4200",
])
AUTH_PASSWORD_VALIDATORS = [
    { 'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator', },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# AUDIT v4.8: We point EVERYTHING to FRONTEND_DIR since the user says staticfiles is empty.
STATIC_URL = '/static/'

STATICFILES_DIRS = [] # Since we serve from STATIC_ROOT in production

# The 'Source of Truth' is the folder containing index.html (frontend_build)
STATIC_ROOT = os.path.normpath(str(FRONTEND_DIR))

# We use simple storage for now to avoid Manifest missing errors in multi-stage setup
STATICFILES_STORAGE = 'whitenoise.storage.StaticFilesStorage'
WHITENOISE_INDEX_FILE = True

# Security: Allow being displayed in the Hub's iframe
X_FRAME_OPTIONS = 'ALLOWALL'

# Media files (User uploaded content)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.normpath(str(PROJECT_DATA_DIR / 'media'))

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- NOTRE MODÈLE USER PERSONNALISÉ ---
AUTH_USER_MODEL = 'profilmanagement.User' 

AUTHENTICATION_BACKENDS = [
    'apps.profilmanagement.backends.EmailOrUsernameModelBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# --- CONFIGURATION GRAPHENE ---
GRAPHENE = {
    "SCHEMA": "apps.core.graphql.schema.schema" 
}