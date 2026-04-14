import graphene
from apps.core.utils.schema_loader import load_all_queries

# ==============================================================================
# SCHÉMA MAÎTRE DYNAMIQUE
# ==============================================================================
# Au lieu d'importer manuellement chaque app (ce qui casse tout si une app bug),
# on utilise notre loader intelligent qui scanne le projet.
# ==============================================================================

# 1. On charge toutes les queries automatiquement depuis apps/*/graphql/Queries/*.py
found_queries = load_all_queries()

# 2. Construction dynamique de la classe Query
if found_queries:
    # On crée une classe qui hérite de toutes les queries trouvées + ObjectType
    # L'opérateur '*' déballe la liste des classes trouvées
    class Query(*found_queries, graphene.ObjectType):
        pass
else:
    # Fallback de sécurité : Si aucune app n'est installée ou détectée
    # On crée une Query vide pour éviter que Graphene ne plante au démarrage ...
    class Query(graphene.ObjectType):
        debug_message = graphene.String()
        
        def resolve_debug_message(self, info):
            return "Aucune Query détectée. Vérifiez vos dossiers graphql/Queries/"

# 3. Création du schéma final
# (Pas de Mutation pour l'instant, car nous utilisons REST pour le CUD)
schema = graphene.Schema(query=Query)