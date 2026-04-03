# -*- mode: python ; coding: utf-8 -*-
import os
from PyInstaller.utils.hooks import collect_data_files, collect_submodules

block_cipher = None

# Découverte RECURSIVE et DYNAMIQUE de toutes vos applications Django internes
internal_apps_hidden = []
apps_root = os.path.join(os.path.abspath('.'), 'apps')
if os.path.exists(apps_root):
    for root, dirs, files in os.walk(apps_root):
        for file in files:
            if file.endswith('.py') and not file.startswith('__'):
                # Transformer le chemin du fichier en chemin de module Python
                rel_path = os.path.relpath(os.path.join(root, file), os.path.abspath('.'))
                module_path = rel_path.replace(os.sep, '.')[:-3]
                internal_apps_hidden.append(module_path)
        
        for dir_name in dirs:
            if not dir_name.startswith('__'):
                rel_path = os.path.relpath(os.path.join(root, dir_name), os.path.abspath('.'))
                module_path = rel_path.replace(os.sep, '.')
                internal_apps_hidden.append(module_path)

# Ajout des AppConfigs explicites (souvent oubliés par PyInstaller car cités en string dans INSTALLED_APPS)
internal_apps_hidden.extend([
    'apps.core.apps.CoreConfig',
    'apps.profilmanagement.apps.ProfilmanagementConfig',
    'apps.structure.apps.StructureConfig',
    'apps.students.apps.StudentsConfig',
    'apps.hr.apps.HrConfig',
    'apps.pedagogy.apps.PedagogyConfig',
    'apps.documents.apps.DocumentsConfig',
    'apps.evaluations.apps.EvaluationsConfig',
    'apps.finance.apps.FinanceConfig',
])

# S'assurer que les dossiers nécessaires existent pour PyInstaller
for d in ['media', 'frontend_build', 'staticfiles']:
    if not os.path.exists(d):
        os.makedirs(d)

# Analysis of the main entry point (manage.py)
a = Analysis(
    ['manage.py'],
    pathex=['.'],
    binaries=[],
    datas=[
        ('frontend_build', 'frontend_build'),
        ('ethernanos.json', '.'),
        ('hub_security.py', '.'),
        ('media', 'media'), 
    ] + collect_data_files('django') + \
        collect_data_files('rest_framework') + \
        collect_data_files('graphene_django') + \
        collect_data_files('environ') + \
        collect_data_files('whitenoise'),
    hiddenimports=[
        'django.contrib.admin',
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'django.contrib.messages',
        'django.contrib.staticfiles',
        'rest_framework',
        'rest_framework_simplejwt',
        'corsheaders',
        'graphene_django',
        'whitenoise',
        'psycopg2',
        'environ',
        'psutil',
        'waitress',
        # Config and project setup
        'config.settings',
        'config.urls',
        'config.wsgi',
        'apps.core.graphql.schema',
        # Middleware & Auth Backends (Strings in settings.py)
        'django.middleware.security.SecurityMiddleware',
        'whitenoise.middleware',
        'corsheaders.middleware.CorsMiddleware',
        'django.contrib.sessions.middleware.SessionMiddleware',
        'django.middleware.common.CommonMiddleware',
        'django.middleware.csrf.CsrfViewMiddleware',
        'django.contrib.auth.middleware.AuthenticationMiddleware',
        'apps.core.middleware.JWTMiddleware',
        'django.contrib.messages.middleware.MessageMiddleware',
        'django.middleware.clickjacking.XFrameOptionsMiddleware',
        'apps.core.middleware.EstablishmentMiddleware',
        'apps.profilmanagement.backends.EmailOrUsernameModelBackend',
        'django.contrib.auth.backends.ModelBackend',
        # JWT Specifics
        'rest_framework_simplejwt.authentication.default_user_authentication_rule',
        'rest_framework_simplejwt.tokens.AccessToken',
        'rest_framework_simplejwt.models.TokenUser',
    ] + internal_apps_hidden + collect_submodules('apps') + collect_submodules('rest_framework_simplejwt'),
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['.git', '.venv', 'frontend', 'releases', 'staging_tmp'],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='schoolmanage',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True, # Cache la console en arrière-plan en production si False, laisser True pour le debug initial
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='schoolmanage'
)
