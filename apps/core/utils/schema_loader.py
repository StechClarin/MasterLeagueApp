# apps/core/utils/schema_loader.py

import inspect
import pkgutil
import importlib
from django.apps import apps

def load_all_queries():
    """
    Scanne toutes les applications installées (commençant par 'apps.')
    pour trouver automatiquement les classes Query définies dans 'graphql/Queries'.
    
    Retourne une liste de classes Query prêtes à être injectées dans le schéma.
    """
    queries = []
    
    # 1. On parcourt toutes les configs d'apps (core, users, products...)
    for app_config in apps.get_app_configs():
        
        # On ne s'intéresse qu'à nos apps locales (celles dans le dossier 'apps')
        if not app_config.name.startswith('apps.'):
            continue
            
        # Chemin théorique du package Queries : apps.monapp.graphql.Queries
        queries_package_name = f"{app_config.name}.graphql.Queries"
        
        try:
            # On essaie d'importer le package (le dossier)
            queries_module = importlib.import_module(queries_package_name)
        except ImportError as e:
            # Si c'est le package Queries qui manque, on passe
            if e.name == queries_package_name:
                continue
            
            # Sinon, c'est une vraie erreur dans le fichier (dépendance manquante, syntaxe...)
            print(f"⚠️  ERREUR LORS DU CHARGEMENT DES QUERIES DE {app_config.name} :")
            print(f"    {e}")
            # On pourrait raise e pour stopper le serveur, ou continue pour charger le reste
            continue

        # 2. On parcourt tous les fichiers .py dans ce dossier
        if hasattr(queries_module, "__path__"):
            for _, name, _ in pkgutil.iter_modules(queries_module.__path__):
                # Importe le module (ex: apps.users.graphql.Queries.user_query)
                full_module_name = f"{queries_package_name}.{name}"
                try:
                    module = importlib.import_module(full_module_name)
                except ImportError as e:
                    print(f"⚠️ Erreur lors de l'import de {full_module_name}: {e}")
                    continue
                
                # 3. On inspecte le fichier pour trouver la classe Query
                for member_name, member_obj in inspect.getmembers(module):
                    if (inspect.isclass(member_obj) 
                        and member_name.endswith("Query") # Convention: doit finir par "Query"
                        and member_name != "Query"
                        and hasattr(member_obj, "_type_definition")): # C'est bien un type Strawberry
                        
                        # Bingo ! On a trouvé une classe Query (ex: UserQuery)
                        queries.append(member_obj)

    return queries