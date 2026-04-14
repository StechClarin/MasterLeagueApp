import os
from pathlib import Path
from django.core.management.base import BaseCommand
from django.db import connections
from django.db.utils import OperationalError
from django.conf import settings
from django.core.management import call_command

class Command(BaseCommand):
    help = "Diagnostic de santé du projet Ethernanos Hub."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("--- [ Snake Doctor ] Diagnostic en cours... ---"))
        
        # 1. Test Base de Données
        self.stdout.write("1. Connexion Base de Données : ", ending="")
        db_conn = connections['default']
        try:
            db_conn.cursor()
            self.stdout.write(self.style.SUCCESS("OK"))
        except OperationalError:
            self.stdout.write(self.style.ERROR("ECHEC"))

        # 2. Vérification des Migrations en attente
        self.stdout.write("2. Statut des Migrations : ", ending="")
        from django.db.migrations.executor import MigrationExecutor
        executor = MigrationExecutor(db_conn)
        plan = executor.migration_plan(executor.loader.graph.leaf_nodes())
        if not plan:
            self.stdout.write(self.style.SUCCESS("A JOUR"))
        else:
            self.stdout.write(self.style.WARNING(f"PLANIFICATION : {len(plan)} migration(s) en attente."))

        # 3. Permissions Dossier Media
        self.stdout.write("3. Droits d'écriture 'media/' : ", ending="")
        media_path = Path(settings.MEDIA_ROOT)
        if not media_path.exists():
            try:
                media_path.mkdir(parents=True, exist_ok=True)
                self.stdout.write(self.style.SUCCESS("OK (Créé)"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"ECHEC (Creation impossible : {e})"))
        elif os.access(media_path, os.W_OK):
            self.stdout.write(self.style.SUCCESS("OK"))
        else:
            self.stdout.write(self.style.ERROR("ECHEC (Lecture seule)"))

        # 4. Vérification Static Root
        self.stdout.write("4. Dossier Static (Front) : ", ending="")
        static_path = Path(settings.STATIC_ROOT)
        if static_path.exists() and (static_path / 'index.html').exists():
            self.stdout.write(self.style.SUCCESS("VALIDE (index.html trouvé)"))
        else:
            self.stdout.write(self.style.WARNING("INCOMPLET (Lancer './snake updategql' ou 'npm build')"))

        # 5. Sécurité Session Token
        self.stdout.write("5. Jeton de Session Hub : ", ending="")
        if os.environ.get('ETHER_SESSION_TOKEN'):
            self.stdout.write(self.style.SUCCESS("ACTIF"))
        else:
            self.stdout.write(self.style.WARNING("INACTIF (Mode de développement standard)"))

        self.stdout.write(self.style.NOTICE("--- Diagnostic Terminé ---"))
