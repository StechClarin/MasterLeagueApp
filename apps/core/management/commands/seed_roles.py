# Fichier: apps/core/management/commands/seed_roles.py

import os
from pathlib import Path
import environ
from django.core.management.base import BaseCommand, CommandError
from apps.profilmanagement.models import Role, User
from apps.core.models import Group, Establishment, Module, TenantLicense
from django.db import IntegrityError
from django.conf import settings

ROLES_STRUCTURE = {
    # Roles Techniques
    "superadmin": "__ALL__", # Renommé pour correspondre à vos attentes
    "admin": "__ALL__", 
    
    # Roles Métier (School)
    "DIRECTEUR_ETABLISSEMENT": [
        "Gestion des Utilisateurs", "Gestion des Classes", "Gestion des Niveaux", 
        "Gestion des Matières", "Gestion des Années Académiques", "Gestion des Cycles", 
        "Gestion des Personnels", "Gestion des Enseignants", "Gestion des Affectations", 
        "Gestion des Apprenants", "Gestion des Tuteurs", "Gestion des Inscriptions", 
        "Gestion des Plannings", "Gestion des Tarifs", "Gestion des Factures", "Gestion des Paiements",
        "Gestion des Options", "Gestion des Périodes Académiques", "Gestion des Salles",
        "Gestion des Évaluations", "Gestion des Notes", "Gestion des Types d'Évaluations"
    ],
    "DIRECTEUR_ETUDES": [
        "Gestion des Classes", "Gestion des Matières", "Gestion des Enseignants",
        "Gestion des Affectations", "Gestion des Plannings", "Gestion des Apprenants",
        "Gestion des Inscriptions", "Gestion des Options", "Gestion des Périodes Académiques",
        "Gestion des Salles", "Gestion des Évaluations", "Gestion des Notes", "Gestion des Types d'Évaluations"
    ],
    "RESPONSABLE_RH": [
        "Gestion des Personnels", "Gestion des Enseignants", "Gestion des Type de contrat"
    ],
    "SURVEILLANT": [
        "Gestion des Apprenants", "Gestion des Inscriptions"
    ],
    "ENSEIGNANT": [
        "Gestion des Plannings", "Gestion des Évaluations", "Gestion des Notes"
    ],
    "COMPTABLE": [
        "Gestion des Type de contrat", "Gestion des Tarifs", "Gestion des Factures", "Gestion des Paiements"
    ],
    "ELEVE": [],
    "PARENT": []
}

class Command(BaseCommand):
    help = "Crée les Rôles, les lie aux Groupes (définis dans seed_access), et assure l'existence du super-admin."

    def add_arguments(self, parser):
        parser.add_argument('--admin-pass', type=str, help='Default admin password')

    def handle(self, *args, **options):
        self.stdout.write(getattr(self.style, 'NOTICE', lambda x: x)("--- Début du seeding des Rôles (Consolidé) ---"))
        
        all_groups = list(Group.objects.all())

        # 1. Création et Assignation des Rôles
        for role_name, group_names in ROLES_STRUCTURE.items():
            role, created = Role.objects.get_or_create(name=role_name)
            if created:
                self.stdout.write(f"  Rôle '{role_name}' créé.")
            
            # On remplace les groupes pour être clean (idempotence)
            role.groups.clear()

            if group_names == "__ALL__":
                role.groups.set(all_groups)
                role.save()
                self.stdout.write(f"    [OK] '{role_name}' a reçu TOUS les groupes ({len(all_groups)}).")
            else:
                count = 0
                for g_name in group_names:
                    # On cherche le groupe exact (créé par seed_access)
                    g = Group.objects.filter(name=g_name).first()
                    if g:
                        role.groups.add(g)
                        count += 1
                    else:
                        if group_names: # On ne warn que si on attendait des groupes
                             self.stdout.write(getattr(self.style, 'WARNING', lambda x: x)(f"    ⚠ Groupe '{g_name}' introuvable pour le rôle '{role_name}'."))
                
                if count > 0 or not group_names:
                     self.stdout.write(f"    ✔ '{role_name}' a reçu {count} groupes.")

        # 2. Gestion du Super-Admin "ethernanos" (Core Logic)
        self.stdout.write(getattr(self.style, 'NOTICE', lambda x: x)("--- Vérification du Super-Admin 'ethernanos' ---"))
        
        # 1. On cherche d'abord dans les arguments explicites (--admin-pass)
        admin_pass = options.get('admin_pass')

        # 2. On cherche ensuite dans l'environnement système (passé par le Hub)
        if not admin_pass:
            admin_pass = os.environ.get('ADMIN_DEFAULT_PASSWORD')
        
        # 3. Si toujours non trouvé, on tente de charger un fichier .env
        if not admin_pass or admin_pass == "admin":
            env = environ.Env()
            # On cherche dans BASE_DIR et aussi un cran au dessus (cas du binaire OneDir)
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

        # 4. Vérification finale
        if not admin_pass or admin_pass == "admin":
            raise CommandError("[ERREUR] ADMIN_DEFAULT_PASSWORD n'est pas défini (ni via argument, ni dans l'environnement, ni dans un fichier .env).")

        try:
            superadmin_role = Role.objects.get(name="superadmin") # On s'assure de prendre le superadmin
            
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

            # 4. Création du Membership (Contextual Access)
            from apps.core.services.establishment_membership_service import EstablishmentMembershipService
            membership_service = EstablishmentMembershipService()
            
            membership_service.create_or_update_with_roles(
                user=admin_user,
                establishment=establishment,
                roles=[superadmin_role],
                is_owner=True, # Hub admin = Owner
                status='active'
            )
            
            self.stdout.write(getattr(self.style, 'SUCCESS', lambda x: x)("  [OK] Utilisateur 'ethernanos' lié à l'établissement avec le rôle 'superadmin'."))

            # 5. Déblocage de TOUS les modules via TenantLicense
            self.stdout.write(getattr(self.style, 'NOTICE', lambda x: x)("--- Déblocage des Modules pour 'ethernanos' ---"))
            all_modules = Module.objects.all()
            if not all_modules.exists():
                self.stdout.write(getattr(self.style, 'WARNING', lambda x: x)("  ⚠ Aucun module trouvé dans la base de données. N'oubliez pas de lancer le seeder de modules (seed_navigation) avant."))
            else:
                for mod in all_modules:
                    TenantLicense.objects.update_or_create(
                        user=admin_user,
                        module_code=mod.code,
                        defaults={'is_active': True}
                    )
                self.stdout.write(getattr(self.style, 'SUCCESS', lambda x: x)(f"  ✔ {all_modules.count()} modules débloqués pour le propriétaire 'ethernanos'."))

        except Exception as e:
            self.stdout.write(getattr(self.style, 'ERROR', lambda x: x)(f"  [ERROR] {e}"))
            
        self.stdout.write(getattr(self.style, 'SUCCESS', lambda x: x)("--- Seeding Roles termine ---"))
