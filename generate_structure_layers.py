import os
from pathlib import Path

BASE_DIR = Path("/Applications/XAMPP/xamppfiles/htdocs/project_init_django_Angular/apps/structure")

MODELS = [
    {"class": "AcademicYear", "file": "academic_year"},
    {"class": "Cycle", "file": "cycle"},
    {"class": "Level", "file": "level"},
    {"class": "ClassRoom", "file": "classroom"},
    {"class": "Subject", "file": "subject"},
]

def ensure_dir(p: Path):
    p.mkdir(parents=True, exist_ok=True)

def append_export(init_file: Path, line: str):
    if not init_file.exists():
        init_file.write_text("", encoding="utf-8")
    content = init_file.read_text(encoding="utf-8")
    if line not in content:
        init_file.write_text(content + line + "\n", encoding="utf-8")

def generate():
    # Directories
    api_dir = BASE_DIR / "api"
    ctrl_dir = api_dir / "controllers"
    ser_dir = api_dir / "serializers"
    svc_dir = BASE_DIR / "services"
    gql_dir = BASE_DIR / "graphql"
    types_dir = gql_dir / "Types"
    queries_dir = gql_dir / "Queries"

    for d in [ctrl_dir, ser_dir, svc_dir, types_dir, queries_dir]:
        ensure_dir(d)
        if not (d / "__init__.py").exists():
            (d / "__init__.py").write_text("", encoding="utf-8")

    for m in MODELS:
        cls = m["class"]
        fname = m["file"]
        
        print(f"Generating for {cls} ({fname})...")

        # 1. Serializer
        ser_content = f"""from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models.{fname} import {cls}

class {cls}Serializer(BaseSerializer):
    class Meta:
        model = {cls}
        fields = "__all__"
"""
        (ser_dir / f"{fname}_serializer.py").write_text(ser_content, encoding="utf-8")
        append_export(ser_dir / "__init__.py", f"from .{fname}_serializer import {cls}Serializer")

        # 2. Service
        svc_content = f"""from apps.core.services.BaseService import BaseService
from ..models.{fname} import {cls}

class {cls}Service(BaseService):
    model = {cls}
"""
        (svc_dir / f"{fname}_service.py").write_text(svc_content, encoding="utf-8")
        # Services usually don't have __init__ exports in this project? Let's check permissions later, but standard is fine.

        # 3. Controller
        ctrl_content = f"""from apps.core.api.controllers.BaseController import BaseController
from ..serializers.{fname}_serializer import {cls}Serializer
from ...services.{fname}_service import {cls}Service

class {cls}Controller(BaseController):
    serializer_class = {cls}Serializer
    service_class = {cls}Service
"""
        (ctrl_dir / f"{fname}_controller.py").write_text(ctrl_content, encoding="utf-8")
        append_export(ctrl_dir / "__init__.py", f"from .{fname}_controller import {cls}Controller")

        # 4. GQL Type
        type_content = f"""import graphene
from graphene_django.types import DjangoObjectType
from ...models.{fname} import {cls}

class {cls}Type(DjangoObjectType):
    class Meta:
        model = {cls}
        fields = "__all__"
"""
        (types_dir / f"{fname}_type.py").write_text(type_content, encoding="utf-8")
        # Exports for Types? Using loader or manual? Core uses loader.
        
        # 5. GQL Query
        query_content = f"""import graphene
from ..Types.{fname}_type import {cls}Type
from ...models.{fname} import {cls}

class {cls}Query(graphene.ObjectType):
    {cls.lower()} = graphene.Field({cls}Type, id=graphene.ID(required=True))
    {cls.lower()}s = graphene.List({cls}Type)

    def resolve_{cls.lower()}(root, info, id):
        try:
            return {cls}.objects.get(pk=id)
        except {cls}.DoesNotExist:
            return None

    def resolve_{cls.lower()}s(root, info, **kwargs):
        return {cls}.objects.all()
"""
        (queries_dir / f"{fname}_query.py").write_text(query_content, encoding="utf-8")

if __name__ == "__main__":
    generate()
    print("Done.")
