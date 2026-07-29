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
    manifest['exec_command'] = "./snake start"

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
        demo_modules = ['students', 'finance', 'hr', 'structure', 'evaluations', 'pedagogy', 'attendance', 'cars', 'shop']

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

        # C. Suppression des fichiers core liés au modèle scolaire
        core_files_to_delete = [
            os.path.join('apps', 'profilmanagement', 'models', 'contact.py'),
            os.path.join('apps', 'core', 'graphql', 'Queries', 'dashboard_query.py'),
            os.path.join('apps', 'core', 'graphql', 'Types', 'dashboard_type.py'),
            os.path.join('apps', 'core', 'utils', 'school_time.py'),
        ]
        for fpath in core_files_to_delete:
            if os.path.exists(fpath):
                os.remove(fpath)
                print(f"   - Fichier obsolète '{fpath}' supprimé.")

        # D. Nettoyage de config/settings_base.py
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

        # E. Réécriture de la navigation Backend (seed_navigation.py) avec le socle minimal
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

        # F. Réécriture du seeder de données Backend (seed_data.py) avec le socle minimal
        seed_data_path = os.path.join('apps', 'core', 'management', 'commands', 'seed_data.py')
        if os.path.exists(seed_data_path):
            clean_seed_data = """# Fichier généré automatiquement pour structure propre.
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Seed database with initial data'

    def handle(self, *args, **options):
        self.stdout.write('Aucune donnée de démo à insérer.')
"""
            with open(seed_data_path, 'w', encoding='utf-8') as f:
                f.write(clean_seed_data)
            print("   - Fichier de données Backend 'seed_data.py' nettoyé.")

        # G. Réécriture du seeder de permissions Backend (seed_access.py) avec le socle minimal
        seed_access_path = os.path.join('apps', 'core', 'management', 'commands', 'seed_access.py')
        if os.path.exists(seed_access_path):
            clean_seed_access = """# Fichier généré automatiquement pour structure propre.
from django.core.management.base import BaseCommand
from apps.core.models import Group, Permission
from typing import List, Dict, Any

GROUP_STRUCTURE: List[Dict[str, Any]] = [
    {
        "name": "Gestion des Utilisateurs",
        "tag": "user",
        "permissions": [
            {"name": "Lire les utilisateurs", "codename": "view_user"},
            {"name": "Ajouter un utilisateur", "codename": "add_user"},
            {"name": "Modifier un utilisateur", "codename": "change_user"},
            {"name": "Supprimer un utilisateur", "codename": "delete_user"},
        ]
    },
    {
        "name": "Gestion des Rôles",
        "tag": "role",
        "permissions": [
            {"name": "Lire les rôles", "codename": "view_role"},
            {"name": "Ajouter un rôle", "codename": "add_role"},
            {"name": "Modifier un rôle", "codename": "change_role"},
            {"name": "Supprimer un rôle", "codename": "delete_role"},
        ]
    },
    {
        "name": "Gestion des Etablissements",
        "tag": "establishment",
        "permissions": [
            {"name": "Lire les établissements", "codename": "view_establishment"},
            {"name": "Ajouter un établissement", "codename": "add_establishment"},
            {"name": "Modifier un établissement", "codename": "change_establishment"},
            {"name": "Supprimer un établissement", "codename": "delete_establishment"},
        ]
    },
]

class Command(BaseCommand):
    help = "Crée les Permissions et les Groupes selon la structure définie."

    def handle(self, *args, **options):
        self.stdout.write(getattr(self.style, 'NOTICE', lambda x: x)("--- Début du seeding Access (Permissions & Groups) ---"))
        for group_data in GROUP_STRUCTURE:
            group_name = group_data['name']
            tag = group_data['tag']
            group, created = Group.objects.get_or_create(name=group_name)
            if created:
                self.stdout.write(f"  Groupe '{group_name}' créé.")
            group.permissions.clear()
            for perm_data in group_data['permissions']:
                perm, p_created = Permission.objects.get_or_create(
                    codename=perm_data['codename'],
                    defaults={'name': perm_data['name'], 'tag': tag}
                )
                if p_created:
                    self.stdout.write(f"    Permission '{perm.codename}' créée.")
                group.permissions.add(perm)
            self.stdout.write(getattr(self.style, 'SUCCESS', lambda x: x)(f"  ✔ Permissions pour '{group_name}' synchronisées."))
        self.stdout.write(getattr(self.style, 'SUCCESS', lambda x: x)("--- Seeding Access terminé ---"))
"""
            with open(seed_access_path, 'w', encoding='utf-8') as f:
                f.write(clean_seed_access)
            print("   - Fichier de permissions Backend 'seed_access.py' nettoyé.")

        # H. Réécriture du seeder de rôles Backend (seed_roles.py) avec le socle minimal
        seed_roles_path = os.path.join('apps', 'core', 'management', 'commands', 'seed_roles.py')
        if os.path.exists(seed_roles_path):
            clean_seed_roles = """# Fichier généré automatiquement pour structure propre.
import os
from pathlib import Path
import environ
from django.core.management.base import BaseCommand, CommandError
from apps.profilmanagement.models import Role, User
from apps.core.models import Group, Establishment, Module, TenantLicense
from django.conf import settings

ROLES_STRUCTURE = {
    "superadmin": "__ALL__",
    "admin": "__ALL__",
}

class Command(BaseCommand):
    help = "Crée les Rôles, les lie aux Groupes, et assure l'existence du super-admin."

    def add_arguments(self, parser):
        parser.add_argument('--admin-pass', type=str, help='Default admin password')

    def handle(self, *args, **options):
        self.stdout.write(getattr(self.style, 'NOTICE', lambda x: x)("--- Début du seeding des Rôles (Consolidé) ---"))
        all_groups = list(Group.objects.all())
        
        for role_name, group_names in ROLES_STRUCTURE.items():
            role, created = Role.objects.get_or_create(name=role_name)
            if created:
                self.stdout.write(f"  Rôle '{role_name}' créé.")
            role.groups.clear()
            if group_names == "__ALL__":
                role.groups.set(all_groups)
                role.save()
                self.stdout.write(f"    [OK] '{role_name}' a reçu TOUS les groupes ({len(all_groups)}).")

        self.stdout.write(getattr(self.style, 'NOTICE', lambda x: x)("--- Vérification du Super-Admin 'ethernanos' ---"))
        admin_pass = options.get('admin_pass')
        if not admin_pass:
            admin_pass = os.environ.get('ADMIN_DEFAULT_PASSWORD')
        if not admin_pass or admin_pass == "admin":
            env = environ.Env()
            possible_paths = [
                Path(str(settings.BASE_DIR)) / '.env',
                Path(str(settings.BASE_DIR)).parent / '.env'
            ]
            for path in possible_paths:
                if path.exists():
                    environ.Env.read_env(str(path))
                    admin_pass = os.environ.get('ADMIN_DEFAULT_PASSWORD')
                    if admin_pass:
                        self.stdout.write(f"  [OK] Configuration chargée depuis {path}")
                        break
        if not admin_pass or admin_pass == "admin":
            raise CommandError("[ERREUR] ADMIN_DEFAULT_PASSWORD n'est pas défini.")

        try:
            superadmin_role = Role.objects.get(name="superadmin")
            establishment_code = os.environ.get('ETHER_TENANT_ID', 'ETH-NANOS-SPA001')
            establishment_name = f"Ethernanos ({establishment_code})" if establishment_code != 'ETH-NANOS-SPA001' else 'Ethernanos'

            if not User.objects.filter(username='ethernanos').exists():
                admin_user = User.objects.create_superuser(
                    username='ethernanos',
                    email='ethernanos@gmail.com',
                    password=admin_pass
                )
                self.stdout.write(getattr(self.style, 'SUCCESS', lambda x: x)("  ✔ Utilisateur 'ethernanos' créé avec succès."))
            else:
                admin_user = User.objects.get(username='ethernanos')
                self.stdout.write(getattr(self.style, 'WARNING', lambda x: x)("  [OK] Utilisateur 'ethernanos' existant mis à jour."))

            admin_user.is_superuser = True
            admin_user.is_staff = True
            admin_user.hub_id = establishment_code
            admin_user.save()

            establishment, est_created = Establishment.objects.get_or_create(
                code=establishment_code,
                defaults={
                    'name': establishment_name,
                    'user': admin_user
                }
            )
            if not est_created:
                establishment.name = establishment_name
                establishment.user = admin_user
                establishment.save()
                self.stdout.write(getattr(self.style, 'NOTICE', lambda x: x)(f"  [OK] Etablissement existant '{establishment_code}' mis à jour."))
            else:
                self.stdout.write(getattr(self.style, 'SUCCESS', lambda x: x)(f"  ✔ Etablissement '{establishment_name}' créé pour {establishment_code}."))

            from apps.core.services.establishment_membership_service import EstablishmentMembershipService
            membership_service = EstablishmentMembershipService()
            membership_service.create_or_update_with_roles(
                user=admin_user,
                establishment=establishment,
                roles=[superadmin_role],
                is_owner=True,
                status='active'
            )
            self.stdout.write(getattr(self.style, 'SUCCESS', lambda x: x)("  [OK] Utilisateur 'ethernanos' lié à l'établissement avec le rôle 'superadmin'."))

            self.stdout.write(getattr(self.style, 'NOTICE', lambda x: x)("--- Déblocage des Modules pour 'ethernanos' ---"))
            all_modules = Module.objects.all()
            if not all_modules.exists():
                self.stdout.write(getattr(self.style, 'WARNING', lambda x: x)("  ⚠ Aucun module trouvé. Lancez seed_navigation d'abord."))
            else:
                for mod in all_modules:
                    TenantLicense.objects.update_or_create(
                        user=admin_user,
                        module_code=mod.code,
                        defaults={'is_active': True}
                    )
                self.stdout.write(getattr(self.style, 'SUCCESS', lambda x: x)(f"  ✔ {all_modules.count()} modules débloqués."))
        except Exception as e:
            self.stdout.write(getattr(self.style, 'ERROR', lambda x: x)(f"  [ERROR] {e}"))
        self.stdout.write(getattr(self.style, 'SUCCESS', lambda x: x)("--- Seeding Roles termine ---"))
"""
            with open(seed_roles_path, 'w', encoding='utf-8') as f:
                f.write(clean_seed_roles)
            print("   - Fichier de rôles Backend 'seed_roles.py' nettoyé.")

        # I. Réécriture du Component Registry Frontend (component.registry.ts)
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

        # J. Réécriture des Routes Frontend (app.routes.ts)
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
    print("3. Lancez le serveur local : './snake start' ou './snake run'.")
    print("=" * 60 + "\n")

if __name__ == '__main__':
    main()
