# apps/core/utils/schema_loader.py

import inspect
import pkgutil
import importlib

from django.apps import apps
from django.core.exceptions import ImproperlyConfigured


def _get_graphql_field_names(query_cls):
    """
    Retourne les noms GraphQL exposes par une classe de query Strawberry.
    Introspection defensive : retourne [] si la classe n'est pas un type Strawberry.
    """
    definition = getattr(query_cls, '__strawberry_definition__', None)
    if definition is None:
        return []
    return [
        getattr(field, 'name', None) or getattr(field, 'python_name', '')
        for field in getattr(definition, 'fields', [])
    ]


def detect_field_collisions(query_classes):
    """
    Leve une ImproperlyConfigured si deux classes de query exposent le meme champ GraphQL.

    Sans cette garde, le merge par heritage multiple (type('Query', tuple(...), {}))
    ecraserait silencieusement l'un des deux champs via l'ordre de resolution (MRO).
    """
    owners = {}
    for query_cls in query_classes:
        for field_name in _get_graphql_field_names(query_cls):
            if not field_name:
                continue
            if field_name in owners and owners[field_name] is not query_cls:
                raise ImproperlyConfigured(
                    f"[schema_loader] Collision de champ GraphQL '{field_name}' : "
                    f"defini a la fois dans "
                    f"'{owners[field_name].__module__}.{owners[field_name].__name__}' "
                    f"et '{query_cls.__module__}.{query_cls.__name__}'."
                )
            owners.setdefault(field_name, query_cls)


def load_all_queries():
    """
    Scanne toutes les applications installees (commencant par 'apps.')
    pour trouver automatiquement les classes Query definies dans 'graphql/Queries'.

    Politique FAIL-FAST (Zero-Error Policy) :
    - Une erreur reelle d'import (dependance cassee, syntaxe invalide) est LEVEE
      au demarrage via ImproperlyConfigured, au lieu d'etre imprimee puis ignoree.
    - Une collision de champ entre deux apps est detectee et levee explicitement.
    Seul le cas "pas de dossier graphql/Queries" est ignore (c'est un etat normal).
    """
    queries = []

    # 1. On parcourt toutes les configs d'apps (core, users, products...)
    for app_config in apps.get_app_configs():

        # On ne s'interesse qu'a nos apps locales (celles dans le dossier 'apps')
        if not app_config.name.startswith('apps.'):
            continue

        # Chemin theorique du package Queries : apps.monapp.graphql.Queries
        queries_package_name = f"{app_config.name}.graphql.Queries"

        try:
            # On essaie d'importer le package (le dossier)
            queries_module = importlib.import_module(queries_package_name)
        except ImportError as e:
            # Cas normal : l'app n'a pas de dossier Queries -> on passe.
            if e.name == queries_package_name:
                continue

            # Cas anormal : une vraie erreur dans le package (dependance, syntaxe...)
            raise ImproperlyConfigured(
                f"[schema_loader] Impossible d'importer le package de queries "
                f"'{queries_package_name}' : {e}"
            ) from e

        # 2. On parcourt tous les fichiers .py dans ce dossier
        if not hasattr(queries_module, "__path__"):
            continue

        for _, name, _ in pkgutil.iter_modules(queries_module.__path__):
            # Importe le module (ex: apps.users.graphql.Queries.user_query)
            full_module_name = f"{queries_package_name}.{name}"
            try:
                module = importlib.import_module(full_module_name)
            except ImportError as e:
                raise ImproperlyConfigured(
                    f"[schema_loader] Impossible d'importer le module de queries "
                    f"'{full_module_name}' : {e}"
                ) from e

            # 3. On inspecte le fichier pour trouver la classe Query
            for member_name, member_obj in inspect.getmembers(module):
                if (inspect.isclass(member_obj)
                        and member_name.endswith("Query")  # Convention: doit finir par "Query"
                        and member_name != "Query"
                        and hasattr(member_obj, "__strawberry_definition__")):  # Type Strawberry
                    # Bingo ! On a trouve une classe Query (ex: UserQuery)
                    queries.append(member_obj)

    # 4. Garde anti-collision avant le merge par heritage multiple
    detect_field_collisions(queries)

    return queries
