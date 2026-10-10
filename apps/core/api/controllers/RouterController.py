# apps/core/api/controllers/RouterController.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from django.utils.module_loading import import_module
from django.apps import apps
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import NotFound
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

class RouterView(APIView):
    """
    Le Front Controller (Aiguilleur) v2.
    Dynamique, Sécurisé et insensible à la casse des fichiers.
    """
    
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        # [FIX v1.0] Retrait du bloc debug 'export_data' qui court-circuitait super().dispatch()
        # et provoquait une erreur 500 (AssertionError: .accepted_renderer not set on Response).
        return super().dispatch(request, *args, **kwargs)

    def perform_content_negotiation(self, request, force=False):
        """
        [FIX v1.0] L'export/import-trame retourne un HttpResponse brut (CSV/Excel)
        mais utilise le paramètre '?format=csv|excel'. Sans renderer enregistré,
        DRF lève Http404 (filter_renderers) avant même d'exécuter le handler.
        On force donc la négociation pour ces routes afin que le handler s'exécute
        et renvoie le fichier directement (finalize_response laisse passer les
        HttpResponse qui ne sont pas des DRF Response).
        """
        if request.method == 'GET' and any(
            marker in request.path for marker in ('export_data', 'import_template')
        ):
            from rest_framework.renderers import JSONRenderer
            return (JSONRenderer(), JSONRenderer().media_type)
        return super().perform_content_negotiation(request, force)

    FORBIDDEN_METHODS = {
        'dispatch', 'initial', 'check_permissions', 'check_object_permissions',
        'determine_version', 'get_serializer', 'get_serializer_class',
        'get_serializer_instance', 'get_read_serializer_instance',
        'success_response', 'error_response', 'check_membership_permissions',
        'perform_content_negotiation', 'options', 'handle_exception',
        'initialize_request', 'finalize_response', 'get_controller_class',
        'get_app_name_from_model', 'post', 'get', 'put', 'patch', 'delete', 'head'
    }

    def is_valid_action(self, controller_instance, method_name):
        if not method_name or method_name.startswith('_') or method_name in self.FORBIDDEN_METHODS:
            return False
        method = getattr(controller_instance, method_name, None)
        return callable(method)

    def post(self, request, model_name, method_name, pk=None):
        # 1. Trouver la classe du contrôleur
        try:
            controller_class = self.get_controller_class(model_name)
        except (ImportError, AttributeError, LookupError) as e:
            raise NotFound(f"Contrôleur pour '{model_name}' introuvable. Erreur: {str(e)}")

        # 2. Instancier et Vérifier la méthode
        controller_instance = controller_class()
        
        # Lier manuellement la requête (DRF le fait normalement dans dispatch)
        controller_instance.request = request
        controller_instance.format_kwarg = None
        
        # [CRITICAL UPDATE] On doit appeler initial() manuellement pour que le BaseController
        # puisse injecter le contexte (Set Context) avant l'exécution de l'action.
        controller_instance.initial(request)
        
        if not self.is_valid_action(controller_instance, method_name):
            return Response(
                {"detail": f"Action ou méthode '{method_name}' non autorisée sur '{model_name}'."}, 
                status=status.HTTP_405_METHOD_NOT_ALLOWED
            )

        method = getattr(controller_instance, method_name)

        # 3. Vérifier les permissions du contrôleur enfant
        self.check_permissions(request)
        controller_instance.check_permissions(request)

        # 4. Exécuter
        if pk:
            return method(request, pk)
        return method(request)

    def get(self, request, model_name, method_name, pk=None):
        """
        Gère les requêtes GET (principalement pour export_data)
        Utilise la même logique que POST pour la cohérence
        """
        # 1. Trouver la classe du contrôleur
        try:
            controller_class = self.get_controller_class(model_name)
        except (ImportError, AttributeError, LookupError) as e:
            raise NotFound(f"Contrôleur pour '{model_name}' introuvable. Erreur: {str(e)}")

        # 2. Instancier et Vérifier la méthode
        controller_instance = controller_class()
        
        # Lier manuellement la requête (DRF le fait normalement dans dispatch)
        controller_instance.request = request
        controller_instance.format_kwarg = None
        
        # [CRITICAL] On doit appeler initial() pour injecter le contexte (Establishment/User)
        controller_instance.initial(request)
        
        if not self.is_valid_action(controller_instance, method_name):
            return Response(
                {"detail": f"Action ou méthode '{method_name}' non autorisée sur '{model_name}'."}, 
                status=status.HTTP_405_METHOD_NOT_ALLOWED
            )

        method = getattr(controller_instance, method_name)

        # 3. Vérifier les permissions
        self.check_permissions(request)
        controller_instance.check_permissions(request)

        # 4. Exécuter
        if pk:
            return method(request, pk)
        return method(request)



    def get_controller_class(self, model_name):
        """
        Trouve la classe du contrôleur.
        Gère la casse et les aliases : Fichier = snake_case, Classe = PascalCase.
        """
        if model_name.lower() == 'auth':
            raise Http404("L'authentification ne passe pas par le routeur générique.")

        # Mappages d'alias courants
        alias_map = {
            'fee': 'fee_definition',
            'feedefinition': 'fee_definition',
            'academicyear': 'academic_year',
            'academicperiod': 'academic_period',
            'subjectgroup': 'subject_group',
            'contracttype': 'contract_type',
            'stockitem': 'stock_item',
            'evaluationtype': 'evaluation_type',
            'teachingassignment': 'teaching_assignment',
            'classroom': 'class_room',
        }

        normalized_name = alias_map.get(model_name.lower(), model_name)

        app_label = self.get_app_name_from_model(normalized_name)
        if not app_label:
            app_label = self.get_app_name_from_model(normalized_name.replace('_', ''))

        if not app_label:
            raise LookupError(f"Aucune application ne contient le modèle '{model_name}'")

        possible_module_names = [normalized_name.lower()]
        if normalized_name.lower() != model_name.lower():
            possible_module_names.append(model_name.lower())

        module = None
        last_error = None
        for mod_name in possible_module_names:
            module_path = f'apps.{app_label}.api.controllers.{mod_name}_controller'
            try:
                module = import_module(module_path)
                break
            except ImportError as e:
                last_error = e

        if not module:
            raise last_error or ImportError(f"Module introuvable pour '{model_name}'")

        class_name_base = normalized_name.replace('_', ' ').title().replace(' ', '')
        class_name = f'{class_name_base}Controller'

        if hasattr(module, class_name):
            return getattr(module, class_name)

        # Fallback : chercher toute classe finissant par 'Controller' dans le module
        for attr_name in dir(module):
            if attr_name.endswith('Controller') and attr_name != 'BaseController':
                return getattr(module, attr_name)

        raise AttributeError(f"Classe '{class_name}' introuvable dans {module_path}")

    def get_app_name_from_model(self, model_name):
        """
        Scanne les apps pour trouver où habite le modèle.
        """
        for app_config in apps.get_app_configs():
            # On ne scanne que nos apps locales pour gagner du temps
            if not app_config.name.startswith('apps.'):
                continue
                
            try:
                # C'est la méthode officielle Django pour voir si un modèle existe dans une app
                app_config.get_model(model_name)
                return app_config.label # Retourne 'profilmanagement' par exemple
            except LookupError:
                continue
        return None