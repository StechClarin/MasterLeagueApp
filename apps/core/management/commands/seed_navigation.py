# Fichier: apps/core/management/commands/seed_navigation.py

from django.core.management.base import BaseCommand
from django.utils.text import slugify
from apps.core.models import Module, Page

# TA STRUCTURE DE SEED POUR LE MENU
MODULE_STRUCTURE = [
    {
        "name": "Référentiel",
        "order": 1,
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
                "title": "Options / Filières",
                "icon": "subject-icon",
                "order": 3,
                "link": "/options",
                "tags": ["option"]
            },
            {
                "title": "Classes",
                "icon": "class-icon",
                "order": 4,
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
            {
                "title": "Salles",
                "icon": "home-icon",
                "order": 6,
                "link": "/rooms",
                "tags": ["room"]
            },
        ]
    },
    {
        "name": "Vie Scolaire",
        "order": 2,
        "display_mod": "card-view",
        "icon": "student-icon",
        "pages": [
            {
                "title": "Apprenants (Élèves)",
                "icon": "student-icon",
                "order": 0,
                "link": "/students",
                "tags": ["student"]
            },
            {
                "title": "Inscriptions",
                "icon": "assignment-icon",
                "order": 1,
                "link": "/enrollments",
                "tags": ["enrollment"]
            },
        ]
    },
    {
        "name": "Académique",
        "order": 3,
        "display_mod": "card-view",
        "icon": "pedagogy-icon",
        "pages": [
            {
                "title": "Emploi du temps",
                "icon": "calendar-icon",
                "order": 0,
                "link": "/timetable",
                "tags": ["planning"] 
            },
            {
                "title": "Affectations Profs",
                "icon": "assignment-icon",
                "order": 1,
                "link": "/assignments",
                "tags": ["teachingassignment"]
            },
            {
                "title": "Plannings Pédagogiques",
                "icon": "pedagogy-icon",
                "order": 2,
                "link": "/plannings",
                "tags": ["planning"]
            },
        ]
    },
    {
        "name": "Évaluations",
        "order": 4,
        "display_mod": "card-view",
        "icon": "evaluation-icon",
        "pages": [
            {
                "title": "Sessions d'Examens",
                "icon": "exam-icon",
                "order": 1,
                "link": "/evaluations",
                "tags": ["evaluation"]
            },
            {
                "title": "Notes & Bulletins",
                "icon": "edit-icon",
                "order": 2,
                "link": "/grade-entry",
                "tags": ["grade"]
            },
            {
                "title": "Paramétrage Barème",
                "icon": "settings-icon",
                "order": 0,
                "link": "/evaluation-types",
                "tags": ["evaluationtype"]
            },
        ]
    },
    {
        "name": "Ressources Humaines",
        "order": 5,
        "display_mod": "card-view",
        "icon": "hr-icon",
        "pages": [
            {
                "title": "Gestion du Personnel",
                "icon": "personnel-icon",
                "order": 0,
                "link": "/personnels",
                "tags": ["personnel"]
            },
            {
                "title": "Types de Contrat",
                "icon": "contract-icon",
                "order": 1,
                "link": "/contract-types",
                "tags": ["contract_type"]
            },
        ]
    },
    {
        "name": "Administration",
        "order": 10,
        "display_mod": "card-view",
        "icon": "settings-icon",
        "pages": [
            {
                "title": "Comptes Utilisateurs",
                "icon": "user-icon",
                "order": 0,
                "link": "/users",
                "tags": ["user"]
            },
            {
                "title": "Rôles & Permissions",
                "icon": "role-icon",
                "order": 1,
                "link": "/roles",
                "tags": ["role"]
            }
        ]
    },
    {
        "name": "Finance",
        "order": 6,
        "display_mod": "card-view",
        "icon": "evaluation-icon",
        "pages": [
            {
                "title": "Configuration Tarifs",
                "icon": "settings-icon",
                "order": 0,
                "link": "/fees",
                "tags": ["feedefinition"]
            },
            {
                "title": "Facturation",
                "icon": "edit-icon",
                "order": 1,
                "link": "/invoices",
                "tags": ["invoice"]
            },
            {
                "title": "Encaissements",
                "icon": "exam-icon",
                "order": 2,
                "link": "/payments",
                "tags": ["payment"]
            },
            {
                "title": "État de Recouvrement",
                "icon": "clipboard-icon",
                "order": 3,
                "link": "/collection-report",
                "tags": ["payment"]
            },
        ]
    },
]

class Command(BaseCommand):
    help = "Crée les Modules et les Pages pour la navigation."

    def handle(self, *args, **options):
        self.stdout.write(getattr(self.style, 'NOTICE', lambda x: x)("--- Debut du seeding Navigation (Modules & Pages) ---"))
        
        # Point Industrial v22.4: On doit utiliser hard_delete() via 'all_objects' car Module et Page utilisent SoftDeleteManager.
        # delete() les mettrait simplement en is_deleted=True, ce qui ferait échouer l'insertion de nouveaux modules
        # avec le même 'code' unique (ex: mod-referentiel).
        Page.all_objects.all().hard_delete()
        Module.all_objects.all().hard_delete()
        
        for mod_data in MODULE_STRUCTURE:
            # On s'assure que c'est bien un dictionnaire avant d'extraire
            if not isinstance(mod_data, dict):
                continue
                
            pages_data = mod_data.pop('pages', []) 
            if not isinstance(pages_data, list):
                pages_data = []
            
            # Generation automatique du code technique base sur le nom
            mod_code = f"mod-{slugify(str(mod_data.get('name', '')))}"
            
            # Formater l'url de l'icône du module
            icon_name = mod_data.get('icon', '')
            if icon_name:
                # Si c'est le module finance, on utilise l'icône dédiée
                if mod_data.get('name') == "Finance" and icon_name == "evaluation-icon":
                    icon_name = "finance-icon"
                mod_data['icon'] = f"/apps/core/assets/icons/{icon_name}.svg"
            
            module = Module.objects.create(code=mod_code, **mod_data)
            self.stdout.write(f"  Module '{module.name}' cree avec le code '{module.code}'.")
            
            for page_data in pages_data:
                if not isinstance(page_data, dict):
                    continue
                
                page_icon_name = page_data.get('icon', '')
                page_icon_url = f"/apps/core/assets/icons/{page_icon_name}.svg" if page_icon_name else ""
                    
                Page.objects.create(
                    module=module,
                    title=page_data.get('title', ''),
                    icon=page_icon_url,
                    order=page_data.get('order', 1),
                    link=page_data.get('link', ''),
                    permission_tags=page_data.get('tags', []) 
                )
            self.stdout.write(f"    ✔ {len(pages_data)} pages creees pour '{module.name}'.")

        self.stdout.write(getattr(self.style, 'SUCCESS', lambda x: x)("--- Seeding Navigation termine ---"))