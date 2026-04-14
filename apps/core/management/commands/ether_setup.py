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
        self.stdout.write('Step 1: Running Migrations...')
        try:
            call_command('migrate', interactive=False)
            self.stdout.write(self.style.SUCCESS('[OK] Migrations completed.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'[ERROR] Migration failed: {e}'))
            sys.exit(1)

        # 3. Seed Basic Data (Roles, Navigation, etc.)
        # We reuse existing seed commands in an atomic block for professional consistency
        self.stdout.write('Step 2: Seeding System Data...')
        try:
            from django.db import transaction
            with transaction.atomic():
                self.stdout.write('   -> Seeding Access...')
                call_command('seed_access')
                self.stdout.write('   -> Seeding Roles...')
                call_command('seed_roles')
                self.stdout.write('   -> Seeding Navigation...')
                call_command('seed_navigation')
                
            self.stdout.write(self.style.SUCCESS('[OK] System data seeded atomically.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'[ERROR] Seeding failed, rolled back: {e}'))
            # During first setup, seeding failure is fatal for industrial consistency
            sys.exit(1)
        
        # 4. Pull Tenant Metadata (Future)
        # TODO: Implement a real pull from the Cloud Parent DB
        self.stdout.write('Step 3: Pulling Tenant Configuration (Simulation)...')
        self.stdout.write(self.style.SUCCESS('[OK] Setup finished successfully.'))
        self.stdout.write(self.style.SUCCESS('--- ETHER-SETUP COMPLETE ---'))
