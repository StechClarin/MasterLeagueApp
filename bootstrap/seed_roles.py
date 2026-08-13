# Fichier généré automatiquement pour structure propre.
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
