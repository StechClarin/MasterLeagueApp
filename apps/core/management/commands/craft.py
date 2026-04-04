import os
from pathlib import Path
from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError
from django.apps import apps

def pluralize(word: str) -> str:
    if word.endswith('s'): return word
    return word + 's'

# ----------------------------
# Helpers
# ----------------------------
def ensure_dir(p: Path):
    p.mkdir(parents=True, exist_ok=True)

def ensure_file(p: Path, default_content: str = ""):
    if not p.exists():
        p.write_text(default_content, encoding="utf-8")

def append_unique_line(p: Path, line: str):
    ensure_file(p, "")
    content = p.read_text(encoding="utf-8")
    if line not in content:
        p.write_text(content + ("" if content.endswith("\n") else "\n") + line + "\n", encoding="utf-8")


class Command(BaseCommand):
    help = "Couteau-suisse: génère modèles, serializers, contrôleurs, services, et GraphQL."

    def add_arguments(self, parser):
        sub = parser.add_subparsers(dest='command', required=True)
        
        # --- Setup ---
        aprep = sub.add_parser('app:prepare', help="Prépare l'arborescence")
        aprep.add_argument('app_name', type=str, help="Nom de l'app (ex: core)")

        # --- Briques REST (CUD) ---
        m = sub.add_parser('model', help='Crée un modèle')
        m.add_argument('model_name', type=str)
        m.add_argument('app_name', type=str)

        s = sub.add_parser('serializer', help='Crée un Serializer')
        s.add_argument('model_name', type=str)
        s.add_argument('app_name', type=str)

        c = sub.add_parser('controller', help='Crée un Controller')
        c.add_argument('model_name', type=str)
        c.add_argument('app_name', type=str)

        serv = sub.add_parser('service', help='Crée un Service')
        serv.add_argument('model_name', type=str)
        serv.add_argument('app_name', type=str)

        # --- Briques GraphQL (Read) --- (CE QUI TE MANQUAIT)
        gt = sub.add_parser('graphene:type', help='Crée un Type Graphene')
        gt.add_argument('model_name', type=str)
        gt.add_argument('app_name', type=str)

        gq = sub.add_parser('graphene:query', help='Crée une Query Graphene')
        gq.add_argument('model_name', type=str)
        gq.add_argument('app_name', type=str)

        # --- Tout-en-un ---
        sc = sub.add_parser('scaffold', help='Crée TOUT (Model, API, GQL, Migrations)')
        sc.add_argument('model_name', type=str)
        sc.add_argument('app_name', type=str)
        
        # --- DB ---
        am = sub.add_parser('automigrate', help='Crée et applique les migrations')
        am.add_argument('app_name', nargs='?', default=None)
        am.add_argument('--name', type=str)
        
        fr = sub.add_parser('fresh', help='Reset des migrations')
        fr.add_argument('app_name', type=str)

        # Alias pour standard migrate
        mg = sub.add_parser('migrate', help='Applique les migrations (wrapper django migrate)')

    def _check_dependencies(self):
        try:
            import rest_framework
            import graphene_django
        except ImportError:
            raise CommandError("Installez djangorestframework et graphene-django.")

    def _prepare_app_layout(self, app_name_simple: str, *, create_bridge=True):
        try:
            app_dir = Path(apps.get_app_config(app_name_simple).path)
        except LookupError:
            raise CommandError(f"L'app '{app_name_simple}' n'existe pas.")

        # Dossiers REST
        models_dir = app_dir / "models"
        api_dir = app_dir / "api"
        api_controllers_dir = api_dir / "controllers"
        api_serializers_dir = api_dir / "serializers"
        services_dir = app_dir / "services"
        
        # Dossiers GQL
        gql_dir = app_dir / "graphql"
        gql_types_dir = gql_dir / "Types"
        gql_queries_dir = gql_dir / "Queries"

        dirs = [
            models_dir, api_dir, api_controllers_dir, api_serializers_dir, services_dir,
            gql_dir, gql_types_dir, gql_queries_dir
        ]

        for d in dirs:
            ensure_dir(d)
            ensure_file(d / "__init__.py", "")
        
        if create_bridge:
            bridge = app_dir / "models.py" 
            if not bridge.exists():
                bridge.write_text(f"from .models import * # noqa\n", encoding="utf-8")
            else:
                append_unique_line(bridge, "from .models import * # noqa")

        return {
            "app_dir": app_dir,
            "models_dir": models_dir,
            "api_serializers_dir": api_serializers_dir,
            "api_controllers_dir": api_controllers_dir,
            "services_dir": services_dir,
            "gql_types_dir": gql_types_dir,
            "gql_queries_dir": gql_queries_dir,
        }

    # ----------------------------
    # Templates
    # ----------------------------
    def _tpl_model(self, model_name: str) -> str:
        return f"""from django.db import models

class {model_name}(models.Model):
    name = models.CharField(max_length=150, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Ex: image = models.ImageField(upload_to='apps/core/images/', blank=True, null=True)
    # Ex: pdf = models.FileField(upload_to='apps/core/documents/', blank=True, null=True)

    class Meta:
        verbose_name = "{model_name.lower()}"
        verbose_name_plural = "{pluralize(model_name.lower())}"
        ordering = ['-created_at']

    def __str__(self):
        return self.name or f"{model_name} #{{self.pk}}"
"""

    def _tpl_init_import(self, filename: str, classname: str) -> str:
        return f"from .{filename} import {classname}"

    def _tpl_serializer(self, model_name: str) -> str:
        return f"""from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import {model_name}

class {model_name}Serializer(BaseSerializer):
    class Meta:
        model = {model_name}
        fields = "__all__"
"""

    def _tpl_controller(self, model_name: str) -> str:
        return f"""from apps.core.api.controllers.BaseController import BaseController
from ..serializers.{model_name.lower()}_serializer import {model_name}Serializer
from ...services.{model_name.lower()}_service import {model_name}Service

class {model_name}Controller(BaseController):
    serializer_class = {model_name}Serializer
    service_class = {model_name}Service
"""

    def _tpl_service(self, model_name: str) -> str:
        return f"""from apps.core.services.BaseService import BaseService
from ..models import {model_name}

class {model_name}Service(BaseService):
    model = {model_name}
"""

    def _tpl_gql_type(self, model_name: str) -> str:
        return f"""import graphene
from graphene_django.types import DjangoObjectType
from ...models import {model_name}

class {model_name}Type(DjangoObjectType):
    class Meta:
        model = {model_name}
        fields = "__all__"
"""

    def _tpl_gql_query(self, model_name: str) -> str:
        return f"""import graphene
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.{model_name.lower()}_type import {model_name}Type
from ...models import {model_name}

{model_name}PaginatedType = get_paginated_type({model_name}Type)

class {model_name}Query(graphene.ObjectType):
    {model_name.lower()} = graphene.Field({model_name}Type, id=graphene.ID(required=True))
    {pluralize(model_name.lower())} = graphene.Field(
        {model_name}PaginatedType,
        search=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_{model_name.lower()}(root, info, id):
        try:
            return {model_name}.objects.get(pk=id)
        except {model_name}.DoesNotExist:
            return None

    def resolve_{pluralize(model_name.lower())}(root, info, search=None, page=1, page_size=10, **kwargs):
        queryset = {model_name}.objects.all().order_by('-created_at')

        if search:
            queryset = queryset.filter(name__icontains=search)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return {model_name}PaginatedType(**paginated_data)
"""

    # ----------------------------
    # Handle
    # ----------------------------
    def handle(self, *args, **opt):
        cmd = opt['command']
        app_name_arg = opt.get('app_name')
        app_name_simple = app_name_arg.split('.')[-1] if app_name_arg else None

        if cmd == 'app:prepare':
            self._prepare_app_layout(app_name_simple)
            self.stdout.write(self.style.SUCCESS(f"[OK] Arborescence prete pour '{app_name_simple}'"))
            return

        if cmd == 'model':
            model_name = opt['model_name'].capitalize()
            layout = self._prepare_app_layout(app_name_simple)
            file = layout['models_dir'] / f"{model_name.lower()}.py"
            if not file.exists():
                file.write_text(self._tpl_model(model_name), encoding="utf-8")
                append_unique_line(layout['models_dir'] / "__init__.py", self._tpl_init_import(model_name.lower(), model_name))
                self.stdout.write(self.style.SUCCESS(f"[OK] Modele cree"))
            return

        if cmd == 'serializer':
            self._check_dependencies()
            model_name = opt['model_name'].capitalize()
            layout = self._prepare_app_layout(app_name_simple, create_bridge=False)
            file = layout['api_serializers_dir'] / f"{model_name.lower()}_serializer.py"
            if not file.exists():
                file.write_text(self._tpl_serializer(model_name), encoding="utf-8")
                append_unique_line(layout['api_serializers_dir'] / "__init__.py", self._tpl_init_import(f"{model_name.lower()}_serializer", f"{model_name}Serializer"))
                self.stdout.write(self.style.SUCCESS(f"[OK] Serializer cree"))
            return

        if cmd == 'controller':
            self._check_dependencies()
            model_name = opt['model_name'].capitalize()
            layout = self._prepare_app_layout(app_name_simple, create_bridge=False)
            file = layout['api_controllers_dir'] / f"{model_name.lower()}_controller.py"
            if not file.exists():
                file.write_text(self._tpl_controller(model_name), encoding="utf-8")
                self.stdout.write(self.style.SUCCESS(f"[OK] Controller cree"))
            return

        if cmd == 'service':
            model_name = opt['model_name'].capitalize()
            layout = self._prepare_app_layout(app_name_simple, create_bridge=False)
            file = layout['services_dir'] / f"{model_name.lower()}_service.py"
            if not file.exists():
                file.write_text(self._tpl_service(model_name), encoding="utf-8")
                self.stdout.write(self.style.SUCCESS(f"[OK] Service cree"))
            return

        if cmd == 'graphene:type':
            self._check_dependencies()
            model_name = opt['model_name'].capitalize()
            layout = self._prepare_app_layout(app_name_simple, create_bridge=False)
            file = layout['gql_types_dir'] / f"{model_name.lower()}_type.py"
            if not file.exists():
                file.write_text(self._tpl_gql_type(model_name), encoding="utf-8")
                append_unique_line(layout['gql_types_dir'] / "__init__.py", self._tpl_init_import(f"{model_name.lower()}_type", f"{model_name}Type"))
                self.stdout.write(self.style.SUCCESS(f"[OK] Graphene Type cree"))
            return

        if cmd == 'graphene:query':
            self._check_dependencies()
            model_name = opt['model_name'].capitalize()
            layout = self._prepare_app_layout(app_name_simple, create_bridge=False)
            file = layout['gql_queries_dir'] / f"{model_name.lower()}_query.py"
            if not file.exists():
                file.write_text(self._tpl_gql_query(model_name), encoding="utf-8")
                append_unique_line(layout['gql_queries_dir'] / "__init__.py", self._tpl_init_import(f"{model_name.lower()}_query", f"{model_name}Query"))
                self.stdout.write(self.style.SUCCESS(f"[OK] Graphene Query cree"))
            return

        if cmd == 'scaffold':
            model_name = opt['model_name'].capitalize()
            self.stdout.write(self.style.NOTICE(f"--- Scaffold : {model_name} ---"))
            
            # 1. REST
            call_command('craft', 'model', model_name, app_name_simple)
            call_command('craft', 'serializer', model_name, app_name_simple)
            call_command('craft', 'service', model_name, app_name_simple)
            call_command('craft', 'controller', model_name, app_name_simple)
            
            # 2. GraphQL
            call_command('craft', 'graphene:type', model_name, app_name_simple)
            call_command('craft', 'graphene:query', model_name, app_name_simple)
            
            # 3. DB
            self.stdout.write(self.style.NOTICE("* Migrations..."))
            self.automigrate(app_name_simple, f"create_{model_name.lower()}_model")
            
            self.stdout.write(self.style.SUCCESS(f"[OK] Scaffold termine pour {model_name}"))
            return

        # ... (Commandes automigrate et fresh inchangées) ...
        if cmd == 'automigrate':
            mk = ['makemigrations']
            if app_name_simple: mk.append(app_name_simple)
            if opt.get('name'): mk.extend(['--name', opt['name']])
            call_command(*mk)
            call_command('migrate', *( [app_name_simple] if app_name_simple else [] ))
            self.stdout.write(self.style.SUCCESS("[OK] Migrations OK."))
            return
            
        if cmd == 'fresh':
            try:
                app_dir = Path(apps.get_app_config(app_name_simple).path)
            except LookupError:
                raise CommandError(f"L'app '{app_name_simple}' n'existe pas.")
            mig_dir = app_dir / "migrations"
            if mig_dir.exists():
                for f in mig_dir.iterdir():
                    if f.name != "__init__.py" and f.suffix.lower() in [".py", ".pyc"]:
                        f.unlink()
                        self.stdout.write(f"  - supprime: {f.name}")
            call_command('makemigrations', app_name_simple)
            call_command('migrate', app_name_simple)
            self.stdout.write(self.style.SUCCESS("[OK] Fresh migrations OK."))
            return

        if cmd == 'migrate':
            call_command('migrate')
            self.stdout.write(self.style.SUCCESS("[OK] Migrations appliquees."))
            return