# Fichier: apps/core/management/commands/seed_roles.py

import os
from django.core.management.base import BaseCommand
from apps.profilmanagement.models import Role, User
from apps.core.models import Group 
from django.db import IntegrityError

ROLES_STRUCTURE = {
    # Roles Techniques
    "Admin": "__ALL__", # Renommé ou gardé tel quel, c'est le super user technique
    
    # Roles Métier (School)
    "DIRECTEUR_ETABLISSEMENT": [
        "Gestion des Utilisateurs", "Gestion des Classes", "Gestion des Niveaux", 
        "Gestion des Matières", "Gestion des Années Académiques", "Gestion des Cycles", 
        "Gestion des Personnels", "Gestion des Enseignants", "Gestion des Affectations", 
        "Gestion des Apprenants", "Gestion des Tuteurs", "Gestion des Inscriptions", 
        "Gestion des Plannings"
    ],
    "DIRECTEUR_ETUDES": [
        "Gestion des Classes", "Gestion des Matières", "Gestion des Enseignants",
        "Gestion des Affectations", "Gestion des Plannings", "Gestion des Apprenants",
        "Gestion des Inscriptions"
    ],
    "RESPONSABLE_RH": [
        "Gestion des Personnels", "Gestion des Enseignants", "Gestion des Type de contrat"
    ],
    "SURVEILLANT": [
        "Gestion des Apprenants", "Gestion des Inscriptions"
    ],
    "ENSEIGNANT": [
        "Gestion des Plannings"
    ],
    "COMPTABLE": [
        "Gestion des Type de contrat"
    ],
    "ELEVE": [],
    "PARENT": []
}

class Command(BaseCommand):
    help = "Crée les Rôles, les lie aux Groupes (définis dans seed_access), et assure l'existence du super-admin."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("--- Début du seeding des Rôles (Consolidé) ---"))
        
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
                self.stdout.write(f"    ✔ '{role_name}' a reçu TOUS les groupes ({len(all_groups)}).")
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
                             self.stdout.write(self.style.WARNING(f"    ⚠ Groupe '{g_name}' introuvable pour le rôle '{role_name}'."))
                
                if count > 0 or not group_names:
                     self.stdout.write(f"    ✔ '{role_name}' a reçu {count} groupes.")

        # 2. Gestion du Super-Admin "ethernanos" (Core Logic)
        self.stdout.write(self.style.NOTICE("--- Vérification du Super-Admin 'ethernanos' ---"))
        
        admin_pass = os.environ.get('ADMIN_DEFAULT_PASSWORD')
        if not admin_pass or admin_pass == "admin":
            self.stdout.write(self.style.ERROR("[ERREUR] ADMIN_DEFAULT_PASSWORD n'est pas défini ou trop faible."))
            return

        try:
            admin_role = Role.objects.get(name="Admin") # On sait qu'il est créé ci-dessus
            
            if not User.objects.filter(username='ethernanos').exists():
                admin_user = User.objects.create_superuser(
                    username='ethernanos',
                    email='ethernanos@gmail.com',
                    password=admin_pass
                )
                admin_user.roles.add(admin_role)
                self.stdout.write(self.style.SUCCESS("  ✔ Utilisateur 'ethernanos' créé avec succès."))
            else:
                admin_user = User.objects.get(username='ethernanos')
                admin_user.roles.add(admin_role)
                admin_user.is_superuser = True
                admin_user.is_staff = True
                admin_user.save()
                self.stdout.write(self.style.WARNING("  ✔ Utilisateur 'ethernanos' mis à jour (Rôle Admin confirmé)."))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"  [ERREUR] {e}"))
            
        self.stdout.write(self.style.SUCCESS("--- Seeding Rôles terminé ---"))
