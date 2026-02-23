# Fichier: apps/core/management/commands/seed_navigation.py

from django.core.management.base import BaseCommand
from apps.core.models import Module, Page

# TA STRUCTURE DE SEED POUR LE MENU
MODULE_STRUCTURE = [
        {
        "name": "Structure",
        "order": 0,
        "display_mod": "card-view",
        "icon": "pascal-icon-dashboard",
        "pages": [
            {
                "title": "Établissements",
                "icon": "etablisement-icon",
                "order": 0,
                "link": "/establishments",
                "tags": ["establishment"]
            },
            {
                "title": "Cycles & Niveaux",
                "icon": "tree-icon",
                "order": 1,
                "link": "/tree",
                "tags": ["level"]
            },
            {
                "title": "Années Scolaires",
                "icon": "calendar-icon",
                "order": 2,
                "link": "/years",
                "tags": ["academic_year"]
            },

            {
                "title": "Classes",
                "icon": "class-icon",
                "order": 3,
                "link": "/classes",
                "tags": ["classroom"]
            },
            {
                "title": "Matières",
                "icon": "subject-icon",
                "order": 4,
                "link": "/subjects",
                "tags": ["subject"]
            },
            {
                "title": "Périodes Académiques",
                "icon": "calendar-icon",
                "order": 5,
                "link": "/academic-periods",
                "tags": ["academicperiod"]
            },
        ]
    },
    {
        "name": "Admin",
        "order": 10,
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
            }
        ]
    },
    {
        "name": "Scolarité",
        "order": 1,
        "display_mod": "card-view",
        "icon": "student-icon",
        "pages": [
            {
                "title": "Apprenants",
                "icon": "student-icon",
                "order": 0,
                "link": "/students",
                "tags": ["student"]
            },
            {
                "title": "Emploi du temps",
                "icon": "calendar-icon",
                "order": 1,
                "link": "/timetable",
                "tags": ["planning"] 
            },
        ]
    },

    {
        "name": "Ressources Humaines",
        "order": 2,
        "display_mod": "card-view",
        "icon": "hr-icon",
        "pages": [
            {
                "title": "Personnels",
                "icon": "personnel-icon",
                "order": 0,
                "link": "/personnels",
                "tags": ["personnel"]
            },
            {
                "title": "Type de contrat",
                "icon": "contract-icon",
                "order": 1,
                "link": "/contract-types",
                "tags": ["contract_type"]
            },


        ]
    },
    {
        "name": "Pédagogie",
        "order": 15,
        "display_mod": "card-view",
        "icon": "pedagogy-icon",
        "pages": [
            {
                "title": "Affectations",
                "icon": "assignment-icon",
                "order": 0,
                "link": "/assignments",
                "tags": ["teachingassignment"]
            },
            {
                "title": "Plannings",
                "icon": "pedagogy-icon",
                "order": 1,
                "link": "/plannings",
                "tags": ["planning"]
            },
        ]
    },
    {
        "name": "Évaluations",
        "order": 3,
        "display_mod": "card-view",
        "icon": "evaluation-icon",
        "pages": [
            {
                "title": "Dossiers d'Épreuve",
                "icon": "exam-icon",
                "order": 0,
                "link": "/evaluations",
                "tags": ["evaluation"]
            },
            {
                "title": "Saisie des Notes",
                "icon": "edit-icon",
                "order": 1,
                "link": "/grade-entry",
                "tags": ["grade"]
            },
            {
                "title": "Configuration",
                "icon": "settings-icon",
                "order": 2,
                "link": "/evaluation-types",
                "tags": ["evaluationtype"]
            },
            {
                "title": "Performance & Bulletins",
                "icon": "chart-icon",
                "order": 3,
                "link": "/reports",
                "tags": ["grade"]
            },
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