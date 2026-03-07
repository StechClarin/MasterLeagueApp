from rest_framework.response import Response
from apps.core.api.controllers.BaseController import BaseController
from ..serializers.grade_serializer import GradeSerializer
from ...services.grade_service import GradeService

class GradeController(BaseController):
    serializer_class = GradeSerializer
    service_class = GradeService

    def bulk_save(self, request):
        """
        Enregistrement groupé des notes.
        """
        evaluation_id = request.data.get('evaluation_id')
        grades_data = request.data.get('grades', [])
        
        try:
            result = self.service.bulk_save(evaluation_id, grades_data)
            return self.success_response(result, "Notes enregistrées avec succès.", 200)
        except Exception as e:
            return Response({"detail": str(e)}, status=400)
