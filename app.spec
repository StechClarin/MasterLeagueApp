# -*- mode: python ; coding: utf-8 -*-
import os
from PyInstaller.utils.hooks import collect_data_files, collect_submodules

block_cipher = None

# Découverte dynamique de toutes vos applications Django et forçage de l'inclusion de `apps.py` (essentiel pour INSTALLED_APPS)
internal_apps_hidden = []
apps_dir = os.path.join(os.path.abspath('.'), 'apps')
if os.path.exists(apps_dir):
    for app_name in os.listdir(apps_dir):
        if os.path.isdir(os.path.join(apps_dir, app_name)) and not app_name.startswith('__'):
            base = f'apps.{app_name}'
            internal_apps_hidden.extend([
                base,
                f'{base}.apps',
                f'{base}.models',
                f'{base}.views',
                f'{base}.urls',
                f'{base}.admin',
                f'{base}.serializers',
            ])

# Analysis of the main entry point (manage.py)
a = Analysis(
    ['manage.py'],
    pathex=['.'],
    binaries=[],
    datas=[
        ('frontend_build', 'frontend_build'),
        ('ethernanos.json', '.'),
        ('hub_security.py', '.'),
        # Include all apps explicitly if needed, but collect_submodules helps
    ] + collect_data_files('django') + collect_data_files('rest_framework') + collect_data_files('graphene_django'),
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
        'config.settings',
        'config.urls',
        'config.wsgi',
    ] + internal_apps_hidden + collect_submodules('apps'),
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
