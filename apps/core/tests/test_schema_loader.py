"""
Garde-fou P0 : le schéma GraphQL Strawberry doit échouer vite et fort.
- collision de champs entre deux Query classes -> ImproperlyConfigured
- classes non-Strawberry -> liste vide
- load_all_queries() s'exécute sans erreur sur le vrai registry d'apps
"""
import pytest
from django.core.exceptions import ImproperlyConfigured

from apps.core.utils.schema_loader import (
    _get_graphql_field_names,
    detect_field_collisions,
)


class FakeField:
    def __init__(self, name):
        self.name = name
        self.python_name = name


class FakeDef:
    def __init__(self, fields):
        self.fields = fields


def test_field_names_empty_without_strawberry_definition():
    class NotStrawberry:
        pass

    assert _get_graphql_field_names(NotStrawberry) == []


def test_detect_collision_raises():
    class QueryA:
        __strawberry_definition__ = FakeDef([FakeField("users")])

    class QueryB:
        __strawberry_definition__ = FakeDef([FakeField("users")])

    with pytest.raises(ImproperlyConfigured):
        detect_field_collisions([QueryA, QueryB])


def test_no_collision_passes():
    class QueryA:
        __strawberry_definition__ = FakeDef([FakeField("users")])

    class QueryB:
        __strawberry_definition__ = FakeDef([FakeField("roles")])

    detect_field_collisions([QueryA, QueryB])


@pytest.mark.django_db
def test_load_all_queries_integration():
    from apps.core.utils.schema_loader import load_all_queries

    queries = load_all_queries()
    assert isinstance(queries, list)
    assert queries, "Aucune Query Strawberry détectée : schéma vide ?"
    assert all(q.__name__.endswith("Query") for q in queries)
