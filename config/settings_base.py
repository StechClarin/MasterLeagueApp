import os
import sys
from pathlib import Path
import environ
from datetime import timedelta
from corsheaders.defaults import default_headers

# --- CRITICAL: Enforce UTF-8 encoding globally ---
os.environ.setdefault('PYTHONIOENCODING', 'utf-8')
os.environ.setdefault('PYTHONDEFAULTENCODING', 'utf-8')

# Ensure sys.stdout/stderr use UTF-8
if sys.version_info >= (3, 7):
    try:
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        if hasattr(sys.stderr, 'reconfigure'):
            sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# --- INDUSTRIAL PATHS DETECTIVE ---
def find_industrial_path(bundle_root, target_name):
    checks = [
        bundle_root / '_internal' / '_internal' / target_name,
        bundle_root / '_internal' / target_name,
        bundle_root / target_name
    ]
    for p in checks:
        if p.exists():
            return p
    return None

import sys
if getattr(sys, 'frozen', False):
    ROOT = Path(sys._MEIPASS)
    found_frontend = find_industrial_path(ROOT, 'frontend_build')
    FRONTEND_DIR = found_frontend if found_frontend else (ROOT / '_internal' / 'frontend_build')
    PROJECT_DATA_DIR = found_frontend.parent if found_frontend else (ROOT / '_internal')
else:
    candidate_frontend_build = BASE_DIR / 'frontend_build'
    candidate_angular_dist = BASE_DIR / 'frontend' / 'dist' / 'frontend'
    if candidate_frontend_build.exists():
        FRONTEND_DIR = candidate_frontend_build
    elif candidate_angular_dist.exists():
        candidate_angular_browser = candidate_angular_dist / 'browser'
        FRONTEND_DIR = candidate_angular_browser if candidate_angular_browser.exists() else candidate_angular_dist
    else:
        FRONTEND_DIR = candidate_frontend_build
    PROJECT_DATA_DIR = BASE_DIR

# --- Configuration de django-environ ---
env = environ.Env(DEBUG=(bool, False))
env_path = PROJECT_DATA_DIR / '.env'
if env_path.exists():
    environ.Env.read_env(str(env_path))

SECRET_KEY = env('SECRET_KEY', default='django-insecure-ethernanos-hub-local-secret-key-2026')
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['*'])

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

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

ROOT_URLCONF = 'config.urls'

WSGI_APPLICATION = 'config.wsgi.application'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.normpath(str(FRONTEND_DIR)),
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

DATABASES = {
    'default': env.db('DATABASE_URL', default=f'sqlite:///{PROJECT_DATA_DIR / "db.sqlite3"}')
}

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

STATIC_URL = '/static/'
STATIC_ROOT = env('STATIC_ROOT', default=os.path.normpath(str(FRONTEND_DIR)))
STATICFILES_DIRS = [
    PROJECT_DATA_DIR / 'apps' / 'core' / 'assets',
]
STATICFILES_STORAGE = 'whitenoise.storage.StaticFilesStorage'
WHITENOISE_INDEX_FILE = True

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.normpath(str(PROJECT_DATA_DIR / 'media'))

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'profilmanagement.User' 

AUTHENTICATION_BACKENDS = [
    'apps.profilmanagement.backends.EmailOrUsernameModelBackend',
    'django.contrib.auth.backends.ModelBackend',
]

GRAPHENE = {
    "SCHEMA": "apps.core.graphql.schema.schema" 
}
