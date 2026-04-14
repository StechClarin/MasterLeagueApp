from django.core.management.base import BaseCommand
from apps.core.services.provisioning_service import ProvisioningService
import sys

class Command(BaseCommand):
    help = 'Industrial Provisioning: Crée un nouvel établissement et son administrateur dédié.'

    def add_arguments(self, parser):
        parser.add_argument('tenant_id', type=str, help='ID unique du site (ex: T001)')
        parser.add_argument('tenant_name', type=str, help='Nom public du site (ex: Ecole Excellence)')
        parser.add_argument('--email', type=str, help='Email de l\'admin (défaut: ethernanos@gmail.com)')
        parser.add_argument('--password', type=str, help='Mot de passe initial (défaut: admin1234)')
        parser.add_argument('--no-email', action='store_true', help='Désactiver l\'envoi de l\'email de bienvenue')

    def handle(self, *args, **options):
        tenant_id = options['tenant_id']
        tenant_name = options['tenant_name']
        email = options.get('email')
        password = options.get('password', 'admin1234')
        send_email = not options['no_email']

        self.stdout.write(self.style.MIGRATE_HEADING(f"Démarrage du provisioning pour : {tenant_name} ({tenant_id})"))

        try:
            result = ProvisioningService.provision_tenant(
                tenant_id=tenant_id,
                tenant_name=tenant_name,
                admin_email=email,
                password=password,
                send_welcome_email=send_email
            )

            if result['status'] == 'success':
                self.stdout.write(self.style.SUCCESS(f"✔ Provisioning terminé avec succès !"))
                self.stdout.write(f"  - Admin : {result['user_email']}")
                self.stdout.write(f"  - Site  : {result['establishment_name']} ({result['establishment_code']})")
                if result.get('user_created'):
                    self.stdout.write(self.style.WARNING(f"  ⚠ Nouvel utilisateur créé. Mot de passe : {password}"))
                else:
                    self.stdout.write(f"  (Utilisateur existant réutilisé)")
            else:
                self.stdout.write(self.style.ERROR(f"✘ Erreur : {result['error']}"))
                sys.exit(1)

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"✘ Erreur critique lors du provisioning : {str(e)}"))
            sys.exit(1)
