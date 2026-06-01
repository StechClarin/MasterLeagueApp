#!/usr/bin/env python3
"""
Ethernanos Hub Application Bootstrapper
--------------------------------------
Ce script permet d'initialiser rapidement un nouveau projet applicatif à partir du template.
Il nettoie les modules scolaires si nécessaire, génère les identifiants uniques (UUID),
configure les ports, et génère une clé de sécurité Django unique.
"""

import os
import shutil
import uuid
import secrets
import json
import sys

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
    keep_demo_input = input("🏫 Voulez-vous CONSERVER les modules scolaires de démo (Élèves, Finances, RH, Evaluations, Pédagogie, Structure) ? (y/n) [n] : ").strip().lower()
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
    print(f"\n✅ Fichier '{manifest_path}' mis à jour avec succès :")
    print(f"   - ID Unique : {app_uuid}")
    print(f"   - Nom       : {app_name}")
    print(f"   - Port      : {port}")

    # 3. Nettoyage des modules scolaires (si 'n')
    if not keep_demo:
        print("\n🗑️  Nettoyage des modules de démonstration scolaire...")
        
        # Dossiers à supprimer
        apps_to_delete = ['students', 'finance', 'hr', 'structure', 'evaluations', 'pedagogy']
        for app in apps_to_delete:
            dir_path = os.path.join('apps', app)
            if os.path.exists(dir_path):
                shutil.rmtree(dir_path)
                print(f"   - Dossier 'apps/{app}' supprimé.")

        # Nettoyage de settings_base.py
        settings_path = os.path.join('config', 'settings_base.py')
        if os.path.exists(settings_path):
            with open(settings_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            cleaned_lines = []
            removed_apps = [f"apps.{app}.apps." for app in apps_to_delete]
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
            print("   - Références supprimées dans 'config/settings_base.py'.")

    # 4. Génération de la clé secrète Django dans le .env
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
        print("✅ Fichier '.env' configuré avec une clé secrète et un nom de base de données uniques.")
    else:
        # Création d'un .env minimal de base
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
        print("✅ Fichier '.env' créé avec les configurations par défaut.")

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
