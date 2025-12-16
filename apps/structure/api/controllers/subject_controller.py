from apps.core.api.controllers.BaseController import BaseController
from ..serializers.subject_serializer import SubjectSerializer
from ...services.subject_service import SubjectService

class SubjectController(BaseController):
    serializer_class = SubjectSerializer
    service_class = SubjectService
