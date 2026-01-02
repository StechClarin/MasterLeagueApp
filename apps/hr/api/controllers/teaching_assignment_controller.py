from apps.core.api.controllers import BaseController
from ..serializers.teaching_assignment_serializer import TeachingAssignmentSerializer
from ...services.teaching_assignment_service import TeachingAssignmentService

class TeachingAssignmentController(BaseController):
    def __init__(self):
        super().__init__(TeachingAssignmentService(), TeachingAssignmentSerializer)
