# Fichier généré automatiquement pour structure propre.
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from apps.core.models import Module, Page

MODULE_STRUCTURE = [
    {
        "name": "Administration",
        "order": 1,
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
            },
            {
                "title": "Carte Live",
                "icon": "map-icon",
                "order": 2,
                "link": "/map-tracking",
                "tags": ["map"]
            }
        ]
    }
]

from typing import Any

def normalize_icon_path(icon_name: Any) -> str:
    """
    Normalise le nom de l'icône pour former l'URL canonique /icons/<nom>.svg
    """
    if not icon_name or not isinstance(icon_name, str):
        return ""
    
    icon_str = icon_name.strip()
    if not icon_str:
        return ""
        
    if icon_str.startswith("http://") or icon_str.startswith("https://"):
        return icon_str
    
    clean_name = icon_str.lstrip('/')
    if clean_name.startswith('icons/'):
        clean_name = clean_name[6:]
    if clean_name.endswith('.svg'):
        clean_name = clean_name[:-4]
        
    return f"/icons/{clean_name}.svg"

class Command(BaseCommand):
    help = "Crée les Modules et les Pages pour la navigation."

    def handle(self, *args, **options):
        self.stdout.write("--- Debut du seeding Navigation ---")
        Page.all_objects.all().hard_delete()
        Module.all_objects.all().hard_delete()
        
        for mod_data in MODULE_STRUCTURE:
            pages_data = mod_data.pop('pages', [])
            mod_code = f"mod-{slugify(str(mod_data.get('name', '')))}"
            icon_name = mod_data.get('icon', '')
            if icon_name:
                mod_data['icon'] = normalize_icon_path(icon_name)
            
            module = Module.objects.create(code=mod_code, **mod_data)
            for page_data in pages_data:
                page_icon_name = page_data.get('icon', '')
                page_icon_url = normalize_icon_path(page_icon_name) if page_icon_name else ""
                Page.objects.create(
                    module=module,
                    title=page_data.get('title', ''),
                    icon=page_icon_url,
                    order=page_data.get('order', 1),
                    link=page_data.get('link', ''),
                    permission_tags=page_data.get('tags', [])
                )
        self.stdout.write("--- Seeding Navigation termine ---")
