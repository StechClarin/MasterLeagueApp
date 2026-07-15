import os
import sys
import json
import traceback
import urllib.request
import urllib.error
import urllib.parse
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db.transaction import atomic

class Command(BaseCommand):
    help = 'Initializes the local Ethernanos database (SQLite) for the Hub client.'
    
    def add_arguments(self, parser):
        parser.add_argument('--admin-pass', type=str, help='Default admin password')

    def handle(self, *args, **options):
        self.stdout.write(getattr(self.style, 'SUCCESS', lambda x: x)('--- ETHER-SETUP STARTING ---'))
        
        # 1. Verification of the Database Engine
        db_url = os.environ.get('DATABASE_URL', '')
        if not db_url:
             self.stdout.write(getattr(self.style, 'ERROR', lambda x: x)('[FATAL] DATABASE_URL n\'est pas defini. Verifiez votre fichier .env.'))
             sys.exit(1)
        else:
             self.stdout.write(getattr(self.style, 'SUCCESS', lambda x: x)(f'Using Database: {db_url.split("@")[-1] if "@" in db_url else "Database URL set"}'))

        # 2. Run Migrations
        self.stdout.write('[HUB_SIGNAL:MIGRATING]')
        
        # --- AUTO-CREATE DATABASE IF MISSING (Postgres only) ---
        if 'postgres' in db_url:
            self.stdout.write('Step 0: Checking if database exists...')
            try:
                import psycopg2
                from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
                
                # Parse and unquote URL safely
                result = urllib.parse.urlparse(db_url)
                username = urllib.parse.unquote(result.username or '')
                password = urllib.parse.unquote(result.password or '')
                database = urllib.parse.unquote(result.path[1:] or '')
                hostname = result.hostname
                port = result.port
                
                # Connect to 'postgres' maintenance DB (always exists)
                conn = psycopg2.connect(
                    dbname='postgres',
                    user=username,
                    password=password,
                    host=hostname,
                    port=port
                )
                conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
                cur = conn.cursor()
                
                # Safe check using SQL query to avoid triggering PG connection errors
                cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (database,))
                db_exists = cur.fetchone()
                
                if not db_exists:
                    self.stdout.write(f"   [INFO] Database '{database}' missing, attempting to create...")
                    cur.execute(f'CREATE DATABASE "{database}"')
                    self.stdout.write(getattr(self.style, 'SUCCESS', lambda x: x)(f"   [OK] Database '{database}' created successfully."))
                else:
                    self.stdout.write(f"   [OK] Database '{database}' already exists.")
                
                cur.close()
                conn.close()
            except Exception as dbe:
                # Use repr(dbe) here as well to safely handle any encoding issues in the error
                self.stdout.write(getattr(self.style, 'WARNING', lambda x: x)(f"   [WARN] Database auto-creation check failed: {repr(dbe)}"))
                self.stdout.write("   Continuing anyway, migrate will show the final error if it persists.")

        self.stdout.write('Step 1: Running Migrations...')
        try:
            call_command('migrate', interactive=False)
            self.stdout.write(getattr(self.style, 'SUCCESS', lambda x: x)('[OK] Migrations completed.'))
        except Exception as e:
            self.stdout.write(getattr(self.style, 'ERROR', lambda x: x)(f'[ERROR] Migration failed: {repr(e)}'))
            traceback.print_exc(file=sys.stdout)
            sys.exit(1)

        # 3. Seed Basic Data (Roles, Navigation, etc.)
        self.stdout.write('[HUB_SIGNAL:SEEDING]')
        self.stdout.write('Step 2: Seeding System Data...')
        try:
            # pyrefly: ignore [bad-context-manager]
            with atomic():
                self.stdout.write('   -> Seeding Access...')
                call_command('seed_access')
                
                # Initialisation pour eviter UnboundLocalError
                data = {}
                
                cloud_api_url = os.environ.get('ETHER_CLOUD_API_URL')
                tenant_id = os.environ.get('ETHER_TENANT_ID')
                hub_api_key = os.environ.get('ETHER_HUB_API_KEY')

                if cloud_api_url and tenant_id and hub_api_key:
                    self.stdout.write(f'   -> Auto-Pulling data from Cloud API for tenant {tenant_id}...')
                    try:
                        base_url = cloud_api_url if cloud_api_url.endswith('/') else cloud_api_url + '/'
                        sync_url = f"{base_url}external/sync-tenant/?tenant_id={tenant_id}"
                        
                        req = urllib.request.Request(sync_url)
                        req.add_header('X-Hub-Api-Key', hub_api_key)
                        
                        with urllib.request.urlopen(req, timeout=30) as response:
                            if response.status == 200:
                                data = json.loads(response.read().decode())
                                self.stdout.write('   -> Ingesting Cloud Data Locally...')
                                
                                from apps.profilmanagement.models import User
                                
                                admin_data = data.get('admin')
                                if admin_data:
                                    User.objects.update_or_create(
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
                                    self.stdout.write(getattr(self.style, 'SUCCESS', lambda x: x)('   [OK] Super-user ethernanos ingested from Cloud.'))
                                
                                # On lance seed_roles avec le mot de passe reçu
                                call_command('seed_roles', admin_pass=options.get('admin_pass'))
                                self.stdout.write(getattr(self.style, 'SUCCESS', lambda x: x)('   [OK] Auto-Pull & Roles Sync Complete!'))
                            else:
                                self.stdout.write(getattr(self.style, 'ERROR', lambda x: x)(f'   [ERROR] Cloud API returned {response.status}'))
                                call_command('seed_roles', admin_pass=options.get('admin_pass'))
                    except Exception as req_err:
                        self.stdout.write(getattr(self.style, 'ERROR', lambda x: x)(f'   [ERROR] Cloud API Auto-Pull failed: {req_err}'))
                        call_command('seed_roles', admin_pass=options.get('admin_pass'))
                else:
                    self.stdout.write('   -> Seeding Roles (Local Fallback)...')
                    call_command('seed_roles', admin_pass=options.get('admin_pass'))

                self.stdout.write('   -> Seeding Navigation...')
                call_command('seed_navigation')
                
                # --- SYNC LICENSES (UNLOCKED MODULES) ---
                unlocked_codes = data.get('unlocked_module_codes', [])
                if unlocked_codes:
                    self.stdout.write(f'   -> Synchronizing Licenses ({len(unlocked_codes)} active modules)...')
                    from apps.core.models import Module
                    # On active ceux qui sont dans la liste + les modules Core (Referentiel, Admin)
                    # Note: Les codes sont generes en "mod-{slug}"
                    core_codes = ['mod-referentiel', 'mod-administration']
                    
                    # 1. On desactive tout ce qui n'est pas Core
                    Module.objects.exclude(code__in=core_codes).update(is_active=False)
                    
                    # 2. On active ceux qui ont une licence
                    Module.objects.filter(code__in=unlocked_codes).update(is_active=True)
                    
                    active_count = Module.objects.filter(is_active=True).count()
                    self.stdout.write(getattr(self.style, 'SUCCESS', lambda x: x)(f'   [OK] Licenses synced. {active_count} modules are now active.'))
                else:
                    self.stdout.write('   -> No license data found, maintaining default access.')

                self.stdout.write('   -> Seeding Configuration Data (Contracts)...')
                call_command('seed_data')
                self.stdout.write('   -> Seeding Evaluation Types...')
                call_command('seed_evaluation_types')
                
            self.stdout.write(getattr(self.style, 'SUCCESS', lambda x: x)('[OK] System data seeded atomically.'))
        except Exception as e:
            self.stdout.write(getattr(self.style, 'ERROR', lambda x: x)(f'[ERROR] Seeding failed, rolled back: {e}'))
            sys.exit(1)
        
        # 4. Success Signal
        self.stdout.write('[HUB_SIGNAL:SUCCESS]')
        self.stdout.write(getattr(self.style, 'SUCCESS', lambda x: x)('[OK] Setup finished successfully.'))
        self.stdout.write(getattr(self.style, 'SUCCESS', lambda x: x)('--- ETHER-SETUP COMPLETE ---'))
