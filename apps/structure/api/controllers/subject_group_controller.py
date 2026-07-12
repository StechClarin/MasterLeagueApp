from apps.core.api.controllers.BaseController import BaseController
from ..serializers.subject_group_serializer import SubjectGroupSerializer
from ...services.subject_group_service import SubjectGroupService

class SubjectGroupController(BaseController):
    serializer_class = SubjectGroupSerializer
    service_class = SubjectGroupService
