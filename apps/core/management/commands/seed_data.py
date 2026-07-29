# Fichier généré automatiquement pour structure propre.
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Seed database with initial data'

    def handle(self, *args, **options):
        self.stdout.write('Aucune donnée de démo à insérer.')
