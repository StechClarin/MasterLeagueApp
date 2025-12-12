# Fichier: apps/core/management/commands/seed_navigation.py

from django.core.management.base import BaseCommand
from apps.core.models import Module, Page

# TA STRUCTURE DE SEED POUR LE MENU
MODULE_STRUCTURE = [
    {
        "name": "Admin",
        "order": 1,
        "display_mod": "card-view",
        "icon": "pascal-icon-dashboard",
        "pages": [
            {
                "title": "user",
                "icon": "user-icon",
                "order": 1,
                "link": "/users",
                "tags": ["user"]
            },
            {
                "title": "Role",
                "icon": "role-icon",
                "order": 2,
                "link": "/roles",
                "tags": ["role",]
            },
            {
                "title": "Personne",
                "icon": "person-icon",
                "order": 3,
                "link": "/personnes",
                "tags": ["personne"]
            },
            {
                "title": "Ecole",
                "icon": "school-icon",
                "order": 4,
                "link": "/ecoles",
                "tags": ["ecole"]
            },
            {
                "title": "Voiture",
                "icon": "car-icon",
                "order": 5,
                "link": "/voitures",
                "tags": ["voiture"]
            },
            {
                "title": "Evénement",
                "icon": "calendar-icon",
                "order": 6,
                "link": "/evenements",
                "tags": ["evenement"]
            }
        ]
    },
    # --- AJOUTE TES AUTRES MODULES ICI ---
]

class Command(BaseCommand):
    help = "Crée les Modules et les Pages pour la navigation."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("--- Début du seeding Navigation (Modules & Pages) ---"))
        
        Module.objects.all().delete()
        
        for mod_data in MODULE_STRUCTURE:
            pages_data = mod_data.pop('pages', []) 
            
            module = Module.objects.create(**mod_data)
            self.stdout.write(f"  Module '{module.name}' créé.")
            
            for page_data in pages_data:
                Page.objects.create(
                    module=module,
                    title=page_data['title'],
                    icon=page_data['icon'],
                    order=page_data['order'],
                    link=page_data['link'],
                    permission_tags=page_data.get('tags', []) # Utilise .get pour la sécurité
                )
            self.stdout.write(f"    ✔ {len(pages_data)} pages créées pour '{module.name}'.")

        self.stdout.write(self.style.SUCCESS("--- Seeding Navigation terminé ---"))