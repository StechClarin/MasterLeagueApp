#!/usr/bin/env python3
"""
Ethernanos Hub Application Bootstrapper
--------------------------------------
Ce script permet d'initialiser rapidement un nouveau projet applicatif à partir du template.
Il nettoie les modules scolaires (backend et frontend) si nécessaire, génère les
identifiants uniques (UUID), configure les ports, configure la base de données PostgreSQL,
et génère une clé de sécurité Django unique.
"""

import os
import shutil
import uuid
import secrets
import json
import sys
import subprocess

def main():
    print("=" * 60)
    print("🚀 INITIALISATION D'UNE NOUVELLE APPLICATION ETHER_NANOS HUB")
    print("=" * 60)

    # 1. Collecte des informations
    app_name = input("\n📝 Entrez le NOM de votre application (ex: Pme Manager) : ").strip()
    if not app_name:
        print("❌ Le nom de l'application est requis.")
        sys.exit(1)

    # Choix du port
    port_input = input("🔌 Entrez le PORT d'écoute de l'application [8000] : ").strip()
    port = int(port_input) if port_input.isdigit() else 8000

    # Choix de la conservation des modules scolaires
    keep_demo_input = input("🏫 Voulez-vous CONSERVER les modules scolaires de démo ? (y/n) [n] : ").strip().lower()
    keep_demo = keep_demo_input in ['y', 'yes', 'o', 'oui']

    # 2. Mise à jour de ethernanos.json
    manifest_path = 'ethernanos.json'
    if os.path.exists(manifest_path):
        try:
            with open(manifest_path, 'r', encoding='utf-8') as f:
                manifest = json.load(f)
        except Exception:
            manifest = {}
    else:
        manifest = {}

    app_uuid = str(uuid.uuid4())
    manifest['id'] = app_uuid
    manifest['name'] = app_name
    manifest['port'] = port
    manifest['version'] = "1.0.0"
    manifest['exec_command'] = "./hub_start.sh"

    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Fichier '{manifest_path}' mis à jour :")
    print(f"   - ID Unique : {app_uuid}")
    print(f"   - Nom       : {app_name}")
    print(f"   - Port      : {port}")

    # 3. Nettoyage des modules scolaires (si 'n')
    if not keep_demo:
        print("\n🗑️  Nettoyage des modules de démonstration scolaire (Backend et Frontend)...")
        
        # Liste des modules à supprimer
        demo_modules = ['students', 'finance', 'hr', 'structure', 'evaluations', 'pedagogy', 'attendance']

        # A. Suppression dans le Backend (apps/)
        for mod in demo_modules:
            dir_path = os.path.join('apps', mod)
            if os.path.exists(dir_path):
                shutil.rmtree(dir_path)
                print(f"   - Dossier Backend 'apps/{mod}' supprimé.")

        # B. Suppression dans le Frontend (frontend/src/app/features/)
        for mod in demo_modules:
            dir_path = os.path.join('frontend', 'src', 'app', 'features', mod)
            if os.path.exists(dir_path):
                shutil.rmtree(dir_path)
                print(f"   - Dossier Frontend 'features/{mod}' supprimé.")

        # C. Nettoyage de config/settings_base.py
        settings_path = os.path.join('config', 'settings_base.py')
        if os.path.exists(settings_path):
            with open(settings_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            cleaned_lines = []
            removed_apps = [f"apps.{mod}.apps." for mod in demo_modules]
            for line in lines:
                should_remove = False
                for removed in removed_apps:
                    if removed in line:
                        should_remove = True
                        break
                if not should_remove:
                    cleaned_lines.append(line)
            
            with open(settings_path, 'w', encoding='utf-8') as f:
                f.writelines(cleaned_lines)
            print("   - Références de modules supprimées dans 'config/settings_base.py'.")

        # D. Réécriture de la navigation Backend (seed_navigation.py) avec le socle minimal
        seed_nav_path = os.path.join('apps', 'core', 'management', 'commands', 'seed_navigation.py')
        if os.path.exists(seed_nav_path):
            clean_seed_nav = """# Fichier généré automatiquement pour structure propre.
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from apps.core.models import Module, Page

MODULE_STRUCTURE = [
    {
        "name": "Administration",
        "order": 1,
        "display_mod": "card-view",
        "icon": "settings-icon",
        "pages": [
            {
                "title": "Comptes Utilisateurs",
                "icon": "user-icon",
                "order": 0,
                "link": "/users",
                "tags": ["user"]
            },
            {
                "title": "Rôles & Permissions",
                "icon": "role-icon",
                "order": 1,
                "link": "/roles",
                "tags": ["role"]
            }
        ]
    }
]

class Command(BaseCommand):
    help = "Crée les Modules et les Pages pour la navigation."

    def handle(self, *args, **options):
        self.stdout.write("--- Debut du seeding Navigation ---")
        Page.all_objects.all().hard_delete()
        Module.all_objects.all().hard_delete()
        
        for mod_data in MODULE_STRUCTURE:
            pages_data = mod_data.pop('pages', [])
            mod_code = f"mod-{slugify(str(mod_data.get('name', '')))}"
            icon_name = mod_data.get('icon', '')
            if icon_name:
                mod_data['icon'] = f"/apps/core/assets/icons/{icon_name}.svg"
            
            module = Module.objects.create(code=mod_code, **mod_data)
            for page_data in pages_data:
                page_icon_name = page_data.get('icon', '')
                page_icon_url = f"/apps/core/assets/icons/{page_icon_name}.svg" if page_icon_name else ""
                Page.objects.create(
                    module=module,
                    title=page_data.get('title', ''),
                    icon=page_icon_url,
                    order=page_data.get('order', 1),
                    link=page_data.get('link', ''),
                    permission_tags=page_data.get('tags', [])
                )
        self.stdout.write("--- Seeding Navigation termine ---")
"""
            with open(seed_nav_path, 'w', encoding='utf-8') as f:
                f.write(clean_seed_nav)
            print("   - Fichier de navigation Backend 'seed_navigation.py' nettoyé.")

        # E. Réécriture du Component Registry Frontend (component.registry.ts)
        registry_path = os.path.join('frontend', 'src', 'app', 'core', 'routing', 'component.registry.ts')
        if os.path.exists(registry_path):
            clean_registry = """import { Type } from '@angular/core';
import { LoadChildrenCallback } from '@angular/router';

import { AppRoutes } from './routes.enum';

export const COMPONENT_REGISTRY: Record<string, () => Promise<any>> = {
  '/users': () => import('@features/profilmanagement/components/user-list/user-list.component').then(m => m.UserListComponent),
  '/roles': () => import('@features/profilmanagement/components/role-list/role-list.component').then(m => m.RoleListComponent),
};
"""
            with open(registry_path, 'w', encoding='utf-8') as f:
                f.write(clean_registry)
            print("   - Registre des composants Frontend 'component.registry.ts' nettoyé.")

        # F. Réécriture des Routes Frontend (app.routes.ts)
        routes_path = os.path.join('frontend', 'src', 'app', 'app.routes.ts')
        if os.path.exists(routes_path):
            clean_routes = """import { Routes } from '@angular/router';
import { LoginComponent } from '@features/auth/login/login.component';
import { MainLayoutComponent } from '@layout/main-layout/main-layout.component';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'profils/roles',
        loadChildren: () => import('@features/profilmanagement/profil.routes').then(m => m.PROFIL_ROUTES)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
"""
            with open(routes_path, 'w', encoding='utf-8') as f:
                f.write(clean_routes)
            print("   - Fichier de routage Frontend 'app.routes.ts' nettoyé.")

    # 5. Remplacement dynamique du nom dans la Sidebar du Frontend
    sidebar_path = os.path.join('frontend', 'src', 'app', 'layout', 'components', 'sidebar', 'sidebar.component.ts')
    if os.path.exists(sidebar_path):
        with open(sidebar_path, 'r', encoding='utf-8') as f:
            sidebar_content = f.read()
        
        # Remplacement de "Kelassy" par le nom personnalisé
        sidebar_content = sidebar_content.replace('Kelassy', app_name)
        with open(sidebar_path, 'w', encoding='utf-8') as f:
            f.write(sidebar_content)
        print(f"✅ Nom de l'application '{app_name}' injecté dans la Sidebar Frontend.")

    # 6. Génération de la clé secrète Django dans le .env
    env_path = '.env'
    new_secret = secrets.token_urlsafe(50)
    
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        new_lines = []
        secret_replaced = False
        for line in lines:
            if line.startswith('SECRET_KEY='):
                new_lines.append(f"SECRET_KEY='django-insecure-{new_secret}'\n")
                secret_replaced = True
            elif line.startswith('DATABASE_NAME='):
                db_safe_name = app_name.lower().replace(' ', '_').replace('-', '_')
                new_lines.append(f"DATABASE_NAME=db_{db_safe_name}\n")
            elif line.startswith('DATABASE_URL='):
                db_safe_name = app_name.lower().replace(' ', '_').replace('-', '_')
                new_lines.append(f"DATABASE_URL=postgres://postgres:postgres@localhost:5432/db_{db_safe_name}\n")
            else:
                new_lines.append(line)
        
        if not secret_replaced:
            new_lines.append(f"\nSECRET_KEY='django-insecure-{new_secret}'\n")

        with open(env_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print("✅ Fichier '.env' configuré avec des valeurs uniques.")
    else:
        db_safe_name = app_name.lower().replace(' ', '_').replace('-', '_')
        with open(env_path, 'w', encoding='utf-8') as f:
            f.write(f"DEBUG=True\n")
            f.write(f"SECRET_KEY='django-insecure-{new_secret}'\n")
            f.write(f"DATABASE_NAME=db_{db_safe_name}\n")
            f.write(f"DATABASE_URL=postgres://postgres:postgres@localhost:5432/db_{db_safe_name}\n")
            f.write(f"CORS_ALLOWED_ORIGINS=http://localhost:4200,http://127.0.0.1:4200\n")
            f.write(f"CSRF_TRUSTED_ORIGINS=http://localhost:4200,http://127.0.0.1:4200\n")
            f.write(f"ALLOWED_HOSTS=localhost,127.0.0.1\n")
            f.write(f"HUB_API_KEY=ethernanos-hub-secret-2026\n")
        print("✅ Fichier '.env' initialisé.")

    # 6.5 Création automatique de la base de données PostgreSQL
    db_name = f"db_{app_name.lower().replace(' ', '_').replace('-', '_')}"
    db_user = "postgres"
    db_password = "postgres"
    db_host = "localhost"
    db_port = "5432"

    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                if line.startswith('USER='):
                    db_user = line.split('=', 1)[1].strip().strip("'").strip('"')
                elif line.startswith('PASSWORD='):
                    db_password = line.split('=', 1)[1].strip().strip("'").strip('"')
                elif line.startswith('HOST='):
                    db_host = line.split('=', 1)[1].strip().strip("'").strip('"')
                elif line.startswith('PORT='):
                    db_port = line.split('=', 1)[1].strip().strip("'").strip('"')

    print(f"\n🐘 Tentative de création de la base de données PostgreSQL '{db_name}'...")
    try:
        import psycopg2
        from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
        
        # Connexion à PostgreSQL sur la base par défaut 'postgres'
        conn = psycopg2.connect(
            dbname='postgres',
            user=db_user,
            password=db_password,
            host=db_host,
            port=db_port
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Vérification d'existence
        cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{db_name}'")
        exists = cursor.fetchone()
        if not exists:
            cursor.execute(f"CREATE DATABASE {db_name}")
            print(f"✅ Base de données '{db_name}' créée avec succès.")
        else:
            print(f"ℹ️ La base de données '{db_name}' existe déjà.")
            
        cursor.close()
        conn.close()
    except ImportError:
        print("⚠️ Le module 'psycopg2' n'est pas disponible pour créer automatiquement la base de données.")
    except Exception as e:
        print(f"⚠️ Erreur lors de la création de la base de données '{db_name}' : {e}")

    # 7. Regénération automatique des enums de routes si demandée
    if not keep_demo:
        print("\n🔄 Regénération automatique des enums de routes...")
        try:
            # On lance la commande Django pour générer le fichier routes.enum.ts propre
            subprocess.run([sys.executable, 'manage.py', 'start_generate_routes'], check=True)
            print("✅ Enums de routes régénérés dans 'routes.enum.ts'.")
        except Exception as e:
            print(f"⚠️  Impossible de régénérer automatiquement les routes.enum.ts : {e}")

    print("\n" + "=" * 60)
    print("🎉 APPLICATION INITIALISÉE AVEC SUCCÈS !")
    print("=" * 60)
    print("Prochaines étapes conseillées :")
    print("1. Créez votre branche git pour l'application.")
    print("2. Exécutez 'python manage.py makemigrations' et 'python manage.py migrate'.")
    print("3. Lancez le serveur local : './hub_start.sh' ou 'python manage.py runserver'.")
    print("=" * 60 + "\n")

if __name__ == '__main__':
    main()
