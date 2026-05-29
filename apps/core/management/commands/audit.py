import json
from django.core.management.base import BaseCommand
from django.test import Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.apps import apps
from django.db.models import Model
from apps.core.models.establishment import Establishment

class Command(BaseCommand):
    help = 'Audit global : Teste les endpoints REST (CUD) et GraphQL (R) pour tous les modèles exposés.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('=== DÉMARRAGE DE L\'AUDIT GLOBAL (REST & GRAPHQL) ===\n'))
        
        # 1. Setup Client & Authentification
        client = Client(SERVER_NAME='127.0.0.1')
        User = get_user_model()
        user = User.objects.filter(is_superuser=True, is_active=True).first() or User.objects.filter(is_active=True).first()
        
        if not user:
            self.stdout.write(self.style.ERROR('[CRITIQUE] Aucun utilisateur actif trouvé pour simuler les requêtes.'))
            return
            
        # 2. Forcer l'authentification (Simulation d'un token JWT)
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        headers = {
            'HTTP_AUTHORIZATION': f'Bearer {access_token}'
        }
        
        self.stdout.write(self.style.SUCCESS(f'[OK] Authentifié en tant que : {user.email}'))
        
        # S'assurer d'avoir un établissement courant dans la session/headers (requis par le BaseController)
        est = Establishment.objects.first()
        if est:
            headers['HTTP_X_ESTABLISHMENT_ID'] = str(est.id)
            self.stdout.write(self.style.SUCCESS(f'[OK] Établissement de test : {est.name}'))

        # 3. Récupérer tous les modèles de nos apps (exclusion des apps tierces)
        target_apps = ['structure', 'profilmanagement', 'hr', 'students', 'finance', 'pedagogy', 'evaluations', 'documents']
        models_to_test = []
        
        for app_name in target_apps:
            try:
                app_config = apps.get_app_config(app_name)
                for model in app_config.get_models():
                    # On exclut les modèles de liaison générés automatiquement
                    if not model._meta.auto_created:
                        models_to_test.append((app_name, model))
            except LookupError:
                continue

        self.stdout.write(self.style.NOTICE(f'\n[INFO] {len(models_to_test)} modèles identifiés pour le test.\n'))

        errors = []
        warnings = []

        # 4. Exécuter les tests pour chaque modèle
        import re
        from unittest.mock import patch

        def to_snake_case(name):
            s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
            return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

        def to_camel_case(name):
            s = name[0].lower() + name[1:]
            return s + 's' if not s.endswith('s') else s

        # MOCK PERMISSIONS: On bypass temporairement les vérifications RBAC pour atteindre la couche Serializer
        # sans modifier la base de données.
        with patch('apps.core.api.controllers.BaseController.BaseController.check_membership_permissions', return_value=True):
            for app_name, model in models_to_test:
                model_name = model.__name__
                model_name_snake = to_snake_case(model_name)
                
                self.stdout.write(f'--- Audit de [{app_name.upper()}] {model_name} ---')
                
                # --- TEST REST (Validation & Architecture) ---
                save_url = f'/api/{model_name_snake}/save/'
                try:
                    response = client.post(save_url, data={}, content_type='application/json', **headers)
                    if response.status_code == 500:
                        err_msg = f'REST CREATE [{save_url}] a retourné 500. CRASH DU CODE (Logique interne brisée).'
                        self.stdout.write(self.style.ERROR(f'  ❌ {err_msg}'))
                        errors.append(err_msg)
                    elif response.status_code == 404:
                        err_msg = f'REST CREATE [{save_url}] 404 Not Found. Oubli de "snake craft"? Contrôleur manquant.'
                        self.stdout.write(self.style.ERROR(f'  ❌ {err_msg}'))
                        errors.append(err_msg)
                    elif response.status_code == 400:
                        # LE GRAAL : On attend 400 car un payload vide {} doit échouer sur les Required Fields du Serializer
                        self.stdout.write(self.style.SUCCESS(f'  ✅ ARCHITECTURE REST VALIDE (Le Serializer a intercepté les données vides avec succès).'))
                    elif response.status_code in [200, 201]:
                        warn_msg = f'REST CREATE [{save_url}] a réussi avec payload vide! Le Serializer manque de contraintes strictes.'
                        self.stdout.write(self.style.WARNING(f'  ⚠️ {warn_msg}'))
                        warnings.append(warn_msg)
                    else:
                        self.stdout.write(self.style.WARNING(f'  ⚠️ REST CREATE [{save_url}] Statut inattendu: {response.status_code}'))
                except Exception as e:
                    err_msg = f'REST CREATE [{save_url}] Exception fatale Python: {str(e)}'
                    self.stdout.write(self.style.ERROR(f'  ❌ {err_msg}'))
                    errors.append(err_msg)

                # --- TEST GRAPHQL (Architecture Read) ---
                from apps.core.graphql.schema import schema
                available_queries = schema.query._meta.fields if hasattr(schema, 'query') and hasattr(schema.query, '_meta') else {}
                
                candidates = [
                    to_camel_case(model_name),
                    model_name.lower() + 's',
                    to_snake_case(model_name) + 's',
                    to_camel_case(to_snake_case(model_name) + 's')
                ]
                
                query_name = None
                for candidate in candidates:
                    if candidate in available_queries:
                        components = candidate.split('_')
                        query_name = components[0] + ''.join(x.title() for x in components[1:])
                        break
                
                if not query_name:
                    self.stdout.write(self.style.WARNING(f'  ⚠️ Aucun point d\'entrée GraphQL racine trouvé pour {model_name} (modèle probablement imbriqué ou REST uniquement).'))
                    warnings.append(f'GraphQL: Le modèle {model_name} n\'expose pas de requête racine.')
                    self.stdout.write('')
                    continue
                    
                graphql_query = {
                    "query": f"query {{ {query_name}(page: 1, pageSize: 1) {{ totalCount }} }}"
                }
                
                try:
                    response = client.post('/graphql/', data=json.dumps(graphql_query), content_type='application/json', **headers)
                    if response.status_code == 200:
                        data = response.json()
                        if 'errors' in data:
                            err_msg = f'GRAPHQL READ [{query_name}] a échoué. Détails: {data["errors"]}'
                            self.stdout.write(self.style.ERROR(f'  ❌ {err_msg}'))
                            errors.append(err_msg)
                        else:
                            self.stdout.write(self.style.SUCCESS(f'  ✅ ARCHITECTURE GRAPHQL VALIDE (La Query "{query_name}" est exposée).'))
                    else:
                        try:
                            resp_content = response.json()
                        except Exception:
                            resp_content = response.content.decode('utf-8', errors='replace')
                        err_msg = f'GRAPHQL READ a échoué avec le statut {response.status_code} pour {query_name}. Réponse: {resp_content}'
                        self.stdout.write(self.style.ERROR(f'  ❌ {err_msg}'))
                        errors.append(err_msg)
                except Exception as e:
                    err_msg = f'GRAPHQL READ [{query_name}] Exception fatale Python: {str(e)}'
                    self.stdout.write(self.style.ERROR(f'  ❌ {err_msg}'))
                    errors.append(err_msg)
                    
                self.stdout.write('') # Ligne vide pour aérer

        # 5. Rapport final
        self.stdout.write(self.style.NOTICE('\n=============================================================='))
        self.stdout.write(self.style.NOTICE('RAPPORT D\'AUDIT FINAL'))
        self.stdout.write(self.style.NOTICE('==============================================================\n'))
        
        if errors:
            self.stdout.write(self.style.ERROR(f'🛑 L\'audit a détecté {len(errors)} erreur(s) CRITIQUE(S) (Crash 500) :'))
            for err in errors:
                self.stdout.write(self.style.ERROR(f' - {err}'))
        else:
            self.stdout.write(self.style.SUCCESS('🎉 EXCELLENT ! Aucune erreur 500 n\'a été détectée sur les API REST.'))

        if warnings:
            self.stdout.write(self.style.WARNING(f'\n⚠️ {len(warnings)} avertissement(s) (Principalement des requêtes GraphQL introuvables) :'))
            for warn in warnings:
                self.stdout.write(self.style.WARNING(f' - {warn}'))
                
        self.stdout.write(self.style.NOTICE('\nFin de l\'audit.\n'))

        if errors:
            import sys
            sys.exit(1)
