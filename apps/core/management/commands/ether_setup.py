import os
import sys
from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Initializes the local Ethernanos database (SQLite) for the Hub client.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('--- ETHER-SETUP STARTING ---'))
        
        # 1. Verification of the Database Engine
        db_url = os.environ.get('DATABASE_URL', '')
        if not db_url:
             self.stdout.write(self.style.WARNING('Note: DATABASE_URL is not set. Falling back to local SQLite...'))
             os.environ['DATABASE_URL'] = 'sqlite:///db.sqlite3'
        else:
             self.stdout.write(self.style.SUCCESS(f'Using Database: {db_url.split("@")[-1] if "@" in db_url else "Local"}'))

        # 2. Run Migrations
        self.stdout.write('[HUB_SIGNAL:MIGRATING]')
        self.stdout.write('Step 1: Running Migrations...')
        try:
            call_command('migrate', interactive=False)
            self.stdout.write(self.style.SUCCESS('[OK] Migrations completed.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'[ERROR] Migration failed: {e}'))
            sys.exit(1)

        # 3. Seed Basic Data (Roles, Navigation, etc.)
        self.stdout.write('[HUB_SIGNAL:SEEDING]')
        self.stdout.write('Step 2: Seeding System Data...')
        try:
            from django.db import transaction
            with transaction.atomic():
                self.stdout.write('   -> Seeding Access...')
                call_command('seed_access')
                cloud_api_url = os.environ.get('ETHER_CLOUD_API_URL')
                tenant_id = os.environ.get('ETHER_TENANT_ID')
                hub_api_key = os.environ.get('ETHER_HUB_API_KEY')

                if cloud_api_url and tenant_id and hub_api_key:
                    self.stdout.write(f'   -> Auto-Pulling data from Cloud API for tenant {tenant_id}...')
                    try:
                        import urllib.request
                        import urllib.error
                        import json
                        
                        base_url = cloud_api_url if cloud_api_url.endswith('/') else cloud_api_url + '/'
                        sync_url = f"{base_url}external/sync-tenant/?tenant_id={tenant_id}"
                        
                        req = urllib.request.Request(sync_url)
                        req.add_header('X-Hub-Api-Key', hub_api_key)
                        
                        with urllib.request.urlopen(req, timeout=30) as response:
                            if response.status == 200:
                                data = json.loads(response.read().decode())
                                self.stdout.write('   -> Ingesting Cloud Data Locally...')
                                
                                from apps.profilmanagement.models import User
                                from apps.core.models import Establishment
                                
                                admin_data = data.get('admin')
                                establishments = data.get('establishments', [])
                                
                                if admin_data:
                                    user, _ = User.objects.update_or_create(
                                        id=admin_data['id'],
                                        defaults={
                                            'username': admin_data['username'],
                                            'email': admin_data['email'],
                                            'first_name': admin_data['first_name'],
                                            'last_name': admin_data['last_name'],
                                            'password': admin_data['password_hash'],
                                            'is_staff': admin_data['is_staff'],
                                            'is_active': admin_data['is_active'],
                                            'is_superuser': admin_data.get('is_superuser', False)
                                        }
                                    )
                                    
                                for est_data in establishments:
                                    Establishment.objects.update_or_create(
                                        id=est_data['id'],
                                        defaults={
                                            'name': est_data['name'],
                                            'code': est_data['code'],
                                            'user': user if 'user' in locals() else None,
                                            'hub_id': tenant_id
                                        }
                                    )
                                self.stdout.write(self.style.SUCCESS('   [OK] Auto-Pull Complete!'))
                            else:
                                self.stdout.write(self.style.ERROR(f'   [ERROR] Cloud API returned {response.status}'))
                                call_command('seed_roles')
                    except Exception as req_err:
                        self.stdout.write(self.style.ERROR(f'   [ERROR] Cloud API Auto-Pull failed: {req_err}'))
                        call_command('seed_roles')
                else:
                    self.stdout.write('   -> Seeding Roles (Local Fallback)...')
                    call_command('seed_roles')
                self.stdout.write('   -> Seeding Navigation...')
                call_command('seed_navigation')
                self.stdout.write('   -> Seeding Configuration Data (Contracts)...')
                call_command('seed_data')
                self.stdout.write('   -> Seeding Evaluation Types...')
                call_command('seed_evaluation_types')
                
            self.stdout.write(self.style.SUCCESS('[OK] System data seeded atomically.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'[ERROR] Seeding failed, rolled back: {e}'))
            sys.exit(1)
        
        # 4. Success Signal
        self.stdout.write('[HUB_SIGNAL:SUCCESS]')
        self.stdout.write(self.style.SUCCESS('[OK] Setup finished successfully.'))
        self.stdout.write(self.style.SUCCESS('--- ETHER-SETUP COMPLETE ---'))
