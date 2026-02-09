from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, exceptions
from django.db import transaction
from django.http import Http404
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

class BaseController(APIView):
    """
    Notre Orchestrateur de base (CUD Uniquement).
    Il gère la séquence : 
    Permissions -> Préparation (before_validate) -> Validation -> Service (save).
    """
    
    serializer_class = None
    service_class = None
    
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated] 

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.service_class or not self.serializer_class:
            raise NotImplementedError("Les attributs 'service_class' et 'serializer_class' doivent être définis.")
        self.service = self.service_class()
        self.serializer = self.serializer_class

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

    # --- HELPER POUR RÉPONSE STANDARD ---
    def success_response(self, data, message, status_code):
        return Response({
            "status": "success",
            "message": message,
            "data": data
        }, status=status_code)

    # --- MÉTHODES CUD (Orchestration) ---

    # --- MÉTHODES CUD (Orchestration) ---

    def list(self, request, *args, **kwargs):
        """
        Expose la méthode list du service (READ) avec Pagination.
        """
        # 1. Filtres (Optionnel: on pourrait parser request.query_params)
        filters = {} 
        
        # 2. Appel Service
        queryset = self.service.list(filters)
        
        # 3. Pagination
        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        paginator.page_size = 10 # Défaut, peut être surchargé via settings
        
        page = paginator.paginate_queryset(queryset, request, view=self)
        
        if page is not None:
            serializer = self.serializer(page, many=True)
            # On conserve notre structure de réponse standard "Envelope"
            return self.success_response({
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "results": serializer.data
            }, "Liste récupérée avec succès (paginée).", status.HTTP_200_OK)

        # Fallback si pagination désactivée (peu probable ici)
        data = self.serializer(queryset, many=True).data
        return self.success_response(data, "Liste récupérée avec succès.", status.HTTP_200_OK)

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
        
        # 1. PRÉPARATION (Service)
        # On laisse le service nettoyer les données brutes (ex: trim, upper, formatage)
        # On utilise .copy() pour éviter de modifier la request.data immuable
        raw_data = request.data.copy() if hasattr(request.data, 'copy') else request.data
        prepared_data = self.service.before_validate(raw_data, instance)

        # 2. VALIDATION (Serializer)
        # On valide les données préparées
        serializer = self.serializer(instance, data=prepared_data, partial=bool(instance))
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        validated_data = serializer.validated_data

        # 3. EXÉCUTION (Service)
        try:
            with transaction.atomic():
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
            # (Notre CustomExceptionHandler peut aussi l'attraper si on le laisse lever)
            if hasattr(e, 'detail'):
                raise e # Laisse passer les erreurs DRF
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # 4. RÉPONSE
        data = self.serializer(result).data
        return self.success_response(data, message, status_code)

    def delete(self, request, pk, *args, **kwargs):
        """ Logique pour la suppression """
        instance = self.service.get_by_id(pk)
        
        try:
            result = self.service.delete(instance)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
        return self.success_response(result, "Suppression effectuée avec succès.", status.HTTP_200_OK)

    def status(self, request, pk, *args, **kwargs):
        """ Logique pour le changement de statut """
        try:
            result = self.service.status(pk)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
        # On renvoie l'objet mis à jour
        data = self.serializer(result).data
        return self.success_response(data, "Statut modifié avec succès.", status.HTTP_200_OK)

    def export_data(self, request, *args, **kwargs):
        """
        Export des données au format CSV ou Excel
        GET /api/{endpoint}/export/?format=csv|excel
        """
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