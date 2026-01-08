from apps.core.api.controllers.BaseController import BaseController
from ..serializers.teaching_assignment_serializer import TeachingAssignmentSerializer
from ...services.teaching_assignment_service import TeachingAssignmentService

class TeachingAssignmentController(BaseController):
    serializer_class = TeachingAssignmentSerializer
    service_class = TeachingAssignmentService
