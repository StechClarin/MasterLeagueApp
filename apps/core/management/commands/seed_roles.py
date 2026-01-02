# Fichier: apps/core/management/commands/seed_roles.py

import os
from django.core.management.base import BaseCommand
from apps.profilmanagement.models import Role, User
from apps.core.models import Group 
from django.db import IntegrityError

class Command(BaseCommand):
    help = "Crée les Rôles, les lie aux Groupes, et crée le super-admin par défaut."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("--- Début du seeding des Rôles ---"))
        
        # 1. Gestion du Rôle "Admin"
        self.stdout.write(self.style.NOTICE("--- Configuration du Rôle Admin ---"))
        
        admin_role, created = Role.objects.get_or_create(name="Admin")
        
        all_groups = Group.objects.all()
        admin_role.groups.set(all_groups)
        
        self.stdout.write(f"  ✔ Rôle 'Admin' synchronisé avec {all_groups.count()} groupes.")
        
        # 2. CRÉATION DE TON SUPER-UTILISATEUR "ethernanos"
        self.stdout.write(self.style.NOTICE("--- Création du Super-Admin 'ethernanos' ---"))
        
        admin_pass = os.environ.get('ADMIN_DEFAULT_PASSWORD')
        if not admin_pass or admin_pass == "admin":
            self.stdout.write(self.style.ERROR("[ERREUR] ADMIN_DEFAULT_PASSWORD n'est pas défini ou trop faible."))
            return

        try:
            # Vérifie si l'user existe
            if not User.objects.filter(username='ethernanos').exists():
                # --- CORRECTION ICI ---
                # On ne passe PAS 'role' ou 'roles' dans le constructeur
                admin_user = User.objects.create_superuser(
                    username='ethernanos',
                    email='ethernanos@gmail.com',
                    password=admin_pass
                )

                # On ajoute le rôle APRÈS la création (ManyToMany)
                admin_user.roles.add(admin_role)
                
                self.stdout.write(self.style.SUCCESS("  ✔ Utilisateur 'ethernanos' créé avec succès."))
            else:
                # Mise à jour de l'existant
                admin_user = User.objects.get(username='ethernanos')
                admin_user.roles.add(admin_role) # On s'assure qu'il a le rôle
                admin_user.is_superuser = True
                admin_user.is_staff = True
                admin_user.save()
                self.stdout.write(self.style.WARNING("  ✔ Utilisateur 'ethernanos' mis à jour (Rôle ajouté)."))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"  [ERREUR] {e}"))
            
        self.stdout.write(self.style.SUCCESS("--- Seeding Rôles terminé ---"))