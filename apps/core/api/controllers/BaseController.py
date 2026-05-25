from typing import Any, cast
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, exceptions
from django.db.transaction import atomic
from django.http import Http404
from django.core.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

class BaseController(APIView):
    """
    Notre Orchestrateur de base (CUD Uniquement).
    Il gère la séquence : 
    Permissions -> Préparation (before_validate) -> Validation -> Service (save).
    """
    
    serializer_class: Any = cast(Any, None)
    service_class: Any = cast(Any, None)
    
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated] 

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.service_class or not self.serializer_class:
            raise NotImplementedError("Les attributs 'service_class' et 'serializer_class' doivent être définis.")
        self.service = self.service_class()

    def get_serializer_class(self, action='read'):
        """
        Retourne la classe du serializer à utiliser.
        Peut être surchargé par les enfants pour utiliser des serializers différents
        selon l'action (read vs write).
        """
        return self.serializer_class

    @property
    def serializer(self):
        # On détermine si on est en lecture ou écriture
        action = 'write' if self.request.method in ['POST', 'PUT', 'PATCH'] else 'read'
        return self.get_serializer_class(action)

    def get_serializer_instance(self, *args, **kwargs):
        """ Instancie le serializer courant avec le contexte de la requête """
        kwargs.setdefault('context', {})
        kwargs['context']['request'] = getattr(self, 'request', None)
        return self.serializer(*args, **kwargs)

    def get_read_serializer_instance(self, *args, **kwargs):
        """ Instancie le serializer de lecture avec le contexte de la requête """
        serializer_class = self.get_serializer_class(action='read')
        kwargs.setdefault('context', {})
        kwargs['context']['request'] = getattr(self, 'request', None)
        return serializer_class(*args, **kwargs)

    def initial(self, request, *args, **kwargs):
        """
        Surcharge de la méthode initial de DRF (exécutée avant chaque action).
        On en profite pour injecter le contexte (User, Etablissement) dans le service.
        """
        super().initial(request, *args, **kwargs)
        
        if self.service and hasattr(self.service, 'set_context'):
            # request.establishment_id est défini par notre EstablishmentMiddleware
            est_id = getattr(request, 'establishment_id', None)
            self.service.set_context(request.user, est_id)

    # --- SÉCURITÉ : RBAC CONTEXTUEL ---
    def check_membership_permissions(self, request, permission_type):
        """
        Vérifie si l'utilisateur possède la permission requise au sein de son Membership actuel.
        permission_type: 'view', 'add', 'change', 'delete'
        """
        # 1. Superuser bypass (Maintenance)
        if request.user.is_superuser:
            return True

        # 2. Récupération du contexte établissement
        est_id = getattr(request, 'establishment_id', None)
        if not est_id:
            raise exceptions.PermissionDenied("Aucun établissement sélectionné ou accès refusé.")

        # 3. Construction du Codename (ex: view_personnel, add_student)
        model_name = self.service.model._meta.model_name
        codename = f"{permission_type}_{model_name}"

        # 4. Vérification dans la table de jonction Membership
        from apps.core.models.establishment_membership import EstablishmentMembership
        from django.db.models import Q
        
        # On vérifie si l'un des rôles de l'utilisateur dans cet établissement possède le codename
        # soit via les permissions directes du rôle, soit via les groupes attachés au rôle.
        has_permission = EstablishmentMembership.objects.filter(
            Q(user=request.user),
            Q(establishment_id=est_id),
            Q(status='active'),
            Q(roles__permissions__codename=codename) | Q(roles__groups__permissions__codename=codename)
        ).exists()

        if not has_permission:
            # Sécurité supplémentaire : si l'utilisateur est le PROPRIÉTAIRE, il a tous les droits
            is_owner = EstablishmentMembership.objects.filter(
                user=request.user,
                establishment_id=est_id,
                status='active',
                is_owner=True
            ).exists()
            
            if is_owner:
                return True

            raise exceptions.PermissionDenied(f"Vous n'avez pas la permission '{codename}' dans cet établissement.")

        return True

    # --- HELPER POUR RÉPONSE STANDARD ---
    def success_response(self, data, message, status_code):
        return Response({
            "status": "success",
            "message": message,
            "data": data
        }, status=status_code)

    def error_response(self, message, status_code):
        return Response({
            "status": "error",
            "message": message
        }, status=status_code)

    # --- MÉTHODES CUD (Orchestration) ---

    # --- MÉTHODES CUD (Orchestration) ---

    def list(self, request, *args, **kwargs):
        """
        Expose la méthode list du service (READ) avec Pagination.
        """
        # Vérification Permission : VIEW
        self.check_membership_permissions(request, 'view')

        # 1. Filtres (Optionnel: on pourrait parser request.query_params)
        filters = {} 
        
        # 2. Appel Service
        queryset = self.service.list(filters)
        
        # 3. Pagination
        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        paginator.page_size = 10 # Défaut, peut être surchargé via settings
        
        page = paginator.paginate_queryset(queryset, request, view=self)
        
        # 2. Pagination
        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        paginator.page_size = 10 # Défaut, peut être surchargé via settings
        
        page = paginator.paginate_queryset(queryset, request, view=self)
        
        if page is not None:
            serializer = self.get_serializer_instance(page, many=True)
            # On conserve notre structure de réponse standard "Envelope"
            return self.success_response({
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "results": serializer.data
            }, "Liste récupérée avec succès (paginée).", status.HTTP_200_OK)

        # Fallback si pagination désactivée (peu probable ici)
        data = self.get_serializer_instance(queryset, many=True).data
        return self.success_response(data, "Liste récupérée avec succès.", status.HTTP_200_OK)

    def get_by_id(self, request, pk, *args, **kwargs):
        """
        Récupère un objet par son ID.
        """
        # Vérification Permission : VIEW
        self.check_membership_permissions(request, 'view')

        try:
            instance = self.service.get_by_id(pk)
            # On utilise le serializer de lecture avec le contexte
            data = self.get_read_serializer_instance(instance).data
            return self.success_response(data, "Objet récupéré avec succès.", status.HTTP_200_OK)
        except Exception as e:
            from django.http import Http404
            if isinstance(e, Http404):
                return Response({"detail": "Objet non trouvé."}, status=status.HTTP_404_NOT_FOUND)
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def save(self, request, pk=None, *args, **kwargs):
        """
        Logique unifiée pour Création (POST /) et Modification (POST /id/).
        Supporte l'ID dans l'URL (pk) ou dans le corps de la requête (id).
        """
        instance = None
        
        # 1. Tentative de récupération de l'ID (URL ou Body)
        # Attention: request.data peut être un QueryDict (FormData) ou un dict (JSON)
        object_id = pk or request.data.get('id')
        
        if object_id:
            instance = self.service.get_by_id(object_id)
            # Vérification Permission : CHANGE
            self.check_membership_permissions(request, 'change')
        else:
            # Vérification Permission : ADD
            self.check_membership_permissions(request, 'add')

        # 1. PRÉPARATION (Service)
        # On laisse le service nettoyer les données brutes (ex: trim, upper, formatage)
        # On utilise .copy() pour éviter de modifier la request.data immuable
        raw_data = request.data.copy() if hasattr(request.data, 'copy') else request.data
        
        prepared_data = self.service.before_validate(raw_data, instance)

        # [CRITICAL UPDATE] Expose raw payload to service for nested custom saves (after_save logic)
        self.service.initial_data = prepared_data

        # 2. VALIDATION (Serializer)
        # On valide les données préparées
        serializer = self.get_serializer_instance(instance, data=prepared_data, partial=bool(instance))
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        validated_data = serializer.validated_data

        # 3. EXÉCUTION (Service)
        try:
            # pyrefly: ignore [bad-context-manager]
            with atomic():
                # On délègue tout au service (qui gère create vs update et les hooks)
                result = self.service.save(validated_data, instance)
                
                # Définition du message de succès
                if instance:
                    status_code = status.HTTP_200_OK
                    message = "Modification effectuée avec succès."
                else:
                    status_code = status.HTTP_201_CREATED
                    message = "Création effectuée avec succès."

        except Exception as e:
            # On renvoie une erreur 400 propre
            if isinstance(e, ValidationError):
                return Response(e.message_dict if hasattr(e, 'message_dict') else e.messages, status=status.HTTP_400_BAD_REQUEST)
            
            if hasattr(e, 'detail'):
                raise e # Laisse passer les erreurs DRF
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # 4. RÉPONSE
        # On utilise le serializer de lecture pour la réponse
        data = self.get_read_serializer_instance(result).data
        return self.success_response(data, message, status_code)

    def delete(self, request, pk, *args, **kwargs):
        """ Logique pour la suppression """
        # Vérification Permission : DELETE
        self.check_membership_permissions(request, 'delete')
        
        instance = self.service.get_by_id(pk)
        
        try:
            result = self.service.delete(instance)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
        return self.success_response(result, "Suppression effectuée avec succès.", status.HTTP_200_OK)

    def status(self, request, pk, *args, **kwargs):
        """ Logique pour le changement de statut """
        # Le changement de statut nécessite la permission 'change'
        self.check_membership_permissions(request, 'change')

        try:
            result = self.service.status(pk)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
        # On renvoie l'objet mis à jour
        data = self.get_serializer_instance(result).data
        return self.success_response(data, "Statut modifié avec succès.", status.HTTP_200_OK)

    def export_data(self, request, *args, **kwargs):
        """
        Export des données au format CSV ou Excel
        GET /api/{endpoint}/export/?format=csv|excel
        """
        # Vérification Permission : VIEW (L'export est une lecture de masse)
        self.check_membership_permissions(request, 'view')

        format_type = request.GET.get('format', 'excel')
        
        if format_type not in ['csv', 'excel']:
            return Response(
                {"detail": "Format invalide. Utilisez 'csv' ou 'excel'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            file_response = self.service.export_data(format_type)
            return file_response
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def import_data(self, request, *args, **kwargs):
        """
        Import des données depuis un fichier CSV ou Excel
        POST /api/{endpoint}/import/
        """
        # Vérification Permission : ADD (L'import est une création de masse)
        self.check_membership_permissions(request, 'add')

        if 'file' not in request.FILES:
            return Response(
                {"detail": "Aucun fichier fourni. Utilisez la clé 'file'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file_obj = request.FILES['file']
        
        # Vérification de l'extension
        allowed_extensions = ['.csv', '.xlsx', '.xls']
        file_extension = '.' + file_obj.name.split('.')[-1].lower()
        
        if file_extension not in allowed_extensions:
            return Response(
                {"detail": f"Extension non autorisée. Utilisez: {', '.join(allowed_extensions)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            result = self.service.import_data(file_obj, atomic=False)
            
            if result['status'] == 'error':
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
            return self.success_response(
                result,
                f"Import terminé. {result['imported']} élément(s) importé(s).",
                status.HTTP_200_OK
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def import_template(self, request, *args, **kwargs):
        """
        Télécharge un modèle d'import (Excel)
        GET /api/{endpoint}/import_template/
        """
        try:
            # On utilise la méthode d'export mais avec une limite de 0 pour n'avoir que les en-têtes
            # Ou une méthode spécifique si le service l'implémente
            if hasattr(self.service, 'generate_template'):
                return self.service.generate_template()
            
            # Fallback: Export vide
            return self.service.export_data('excel', empty_template=True)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)