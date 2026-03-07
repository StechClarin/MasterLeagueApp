from apps.core.api.controllers.BaseController import BaseController
from ..serializers.evaluation_serializer import EvaluationSubjectSerializer
from ...services import EvaluationSubjectService
from rest_framework.response import Response
from rest_framework import status


class EvaluationSubjectController(BaseController):
    serializer_class = EvaluationSubjectSerializer
    service_class = EvaluationSubjectService

    def upload_subject_file(self, request, pk):
        """
        Custom endpoint to upload a subjective file directly to the EvaluationSubject model
        instead of using the generic Document table.
        URL: POST /api/evaluationsubject/upload_subject_file/<pk>/
        """
        instance = self.service.get_by_id(pk)
        
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"detail": "Aucun fichier fourni (clé 'file' attendue)."}, status=status.HTTP_400_BAD_REQUEST)
            
        instance.subject_file = file_obj
        instance.save()
        
        return self.success_response(
            self.serializer(instance).data, 
            "Fichier sujet uploadé avec succès.", 
            status.HTTP_200_OK
        )
