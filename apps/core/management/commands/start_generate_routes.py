from django.core.management.base import BaseCommand
from apps.core.management.commands.seed_navigation import MODULE_STRUCTURE
import os

class Command(BaseCommand):
    help = 'Génère le fichier routes.enum.ts pour le Frontend'

    def handle(self, *args, **options):
        self.stdout.write("--- Génération des Routes TypeScript ---")
        
        # Chemin de sortie
        output_path = "frontend/src/app/core/routing/routes.enum.ts"
        
        # Construction du contenu TypeScript
        ts_content = "// Ce fichier est généré automatiquement par './snake generate_routes'.\n"
        ts_content += "// Ne le modifiez pas manuellement.\n\n"
        ts_content += "export enum AppRoutes {\n"
        
        routes_count = 0
        
        for module in MODULE_STRUCTURE:
            for page in module.get('pages', []):
                # Nettoyage du nom pour en faire une clé Enum valide
                # Ex: "Années Scolaires" -> "ANNEES_SCOLAIRES"
                title = page['title']
                
                # Remplacement basique des accents et espaces
                import unicodedata
                normalized = unicodedata.normalize('NFKD', title).encode('ASCII', 'ignore').decode('utf-8')
                enum_key = normalized.upper().replace(' ', '_').replace('-', '_').replace('&', 'AND')
                
                # Filtre caractères spéciaux restants
                enum_key = "".join([c for c in enum_key if c.isalnum() or c == '_'])
                
                link = page['link']
                
                ts_content += f"  {enum_key} = '{link}',\n"
                routes_count += 1
                
        ts_content += "}\n"
        
        # Écriture du fichier
        try:
            with open(output_path, 'w') as f:
                f.write(ts_content)
            self.stdout.write(self.style.SUCCESS(f"[OK] Fichier genere avec succes : {output_path}"))
            self.stdout.write(self.style.SUCCESS(f"[OK] {routes_count} routes exportees."))
        except Exception as e:
             self.stdout.write(self.style.ERROR(f"[ERROR] Erreur : Impossible de trouver le dossier '{output_path}'. Etes-vous a la racine du projet ?"))
