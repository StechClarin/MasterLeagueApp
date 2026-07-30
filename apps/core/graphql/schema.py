import strawberry
from apps.core.utils.schema_loader import load_all_queries

# ==============================================================================
# SCHÉMA MAÎTRE DYNAMIQUE STRAWBERRY
# ==============================================================================
# Au lieu d'importer manuellement chaque app, on scanne dynamiquement.
# ==============================================================================

# 1. On charge toutes les queries automatiquement depuis apps/*/graphql/Queries/*.py
found_queries = load_all_queries()

# 2. Construction dynamique de la classe Query
if found_queries:
    # On crée une classe qui hérite de toutes les queries trouvées
    Query = type('Query', tuple(found_queries), {})
    Query = strawberry.type(Query)
else:
    # Fallback de sécurité : Si aucune app n'est installée ou détectée
    @strawberry.type
    class Query:
        @strawberry.field
        def debug_message(self) -> str:
            return "Aucune Query détectée. Vérifiez vos dossiers graphql/Queries/"

# 3. Création du schéma final
schema = strawberry.Schema(query=Query)