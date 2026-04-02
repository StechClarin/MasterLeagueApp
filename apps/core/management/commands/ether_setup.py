import os
import sys
from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Initializes the local Ethernanos database (SQLite) for the Hub client.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('--- ETHER-SETUP STARTING ---'))
        
        # 1. Ensure we are using SQLite for this local instance
        # This is usually handled by environment variables, but we can double check
        db_engine = os.environ.get('DATABASE_URL', '')
        if 'sqlite' not in db_engine and not os.path.exists('db.sqlite3'):
             self.stdout.write(self.style.WARNING('Note: DATABASE_URL is not set to SQLite. Forcing SQLite for local setup...'))
             os.environ['DATABASE_URL'] = 'sqlite:///db.sqlite3'

        # 2. Run Migrations
        self.stdout.write('Step 1: Running Migrations...')
        try:
            call_command('migrate', interactive=False)
            self.stdout.write(self.style.SUCCESS('[OK] Migrations completed.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'[ERROR] Migration failed: {e}'))
            sys.exit(1)

        # 3. Seed Basic Data (Roles, Navigation, etc.)
        # We reuse existing seed commands
        self.stdout.write('Step 2: Seeding System Data...')
        try:
            call_command('seed_roles')
            call_command('seed_navigation')
            call_command('seed_access')
            self.stdout.write(self.style.SUCCESS('[OK] System data seeded.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'[ERROR] Seeding failed: {e}'))
            # We don't exit here as basic data might already exist
        
        # 4. Pull Tenant Metadata (Future)
        # TODO: Implement a real pull from the Cloud Parent DB
        self.stdout.write('Step 3: Pulling Tenant Configuration (Simulation)...')
        self.stdout.write(self.style.SUCCESS('[OK] Setup finished successfully.'))
        self.stdout.write(self.style.SUCCESS('--- ETHER-SETUP COMPLETE ---'))
