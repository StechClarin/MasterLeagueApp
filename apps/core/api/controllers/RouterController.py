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
        if 'export_data' in request.path:
             return Response({"debug": "RouterView hit!", "path": request.path}, status=200)
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, model_name, method_name, pk=None):
        # 1. Trouver la classe du contrôleur
        try:
            controller_class = self.get_controller_class(model_name)
        except (ImportError, AttributeError, LookupError) as e:
            # Si on ne trouve pas la classe ou le module, c'est une 404.
            # Mais on le fait AVANT d'instancier pour ne pas masquer les bugs internes.
            raise NotFound(f"Contrôleur pour '{model_name}' introuvable. Erreur: {str(e)}")

        # 2. Instancier et Vérifier la méthode
        controller_instance = controller_class()
        
        # [CRITICAL UPDATE] On doit appeler initial() manuellement pour que le BaseController
        # puisse injecter le contexte (Set Context) avant l'exécution de l'action.
        controller_instance.initial(request)
        
        if not hasattr(controller_instance, method_name):
            return Response(
                {"detail": f"Méthode '{method_name}' non trouvée dans '{model_name}'."}, 
                status=status.HTTP_405_METHOD_NOT_ALLOWED
            )

        method = getattr(controller_instance, method_name)

        # 3. Vérifier les permissions du contrôleur enfant
        # (Le BaseController a ses propres checks, mais on force le check ici aussi)
        self.check_permissions(request)
        controller_instance.check_permissions(request)

        # 4. Exécuter
        # (Si ça plante ici, c'est une erreur 500 normale, on ne l'attrape pas)
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
        
        if not hasattr(controller_instance, method_name):
            return Response(
                {"detail": f"Méthode '{method_name}' non trouvée dans '{model_name}'."}, 
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
        Gère la casse : Fichier = minuscule, Classe = Majuscule.
        """
        # Cas spécial pour l'Auth (qui n'est pas un modèle Django)
        if model_name.lower() == 'auth':
            # On redirige vers l'app profilmanagement manuellement ou on lève une erreur
            # car l'Auth doit passer par les routes spécifiques dans urls.py
            raise Http404("L'authentification ne passe pas par le routeur générique.")

        app_label = self.get_app_name_from_model(model_name)
        if not app_label:
            # Retry with removed underscores (e.g. academic_year -> academicyear)
            app_label = self.get_app_name_from_model(model_name.replace('_', ''))
            
        if not app_label:
            raise LookupError(f"Aucune application ne contient le modèle '{model_name}'")
        
        # Construction du chemin :
        # app: 'profilmanagement'
        # fichier: 'role_controller' (minuscule, snake_case)
        # classe: 'RoleController' (PascalCase)
        
        # Fichier : on garde le snake_case (ou on le force si besoin)
        file_name = model_name.lower()
        module_path = f'apps.{app_label}.api.controllers.{file_name}_controller'
        
        # Importation du module
        module = import_module(module_path)
        
        # Récupération de la classe: academic_year -> AcademicYear
        class_name_base = model_name.replace('_', ' ').title().replace(' ', '')
        class_name = f'{class_name_base}Controller'
        
        return getattr(module, class_name)

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