from apps.core.api.controllers.BaseController import BaseController
from ..serializers.level_subject_serializer import LevelSubjectSerializer
from ...services.level_subject_service import LevelSubjectService

class LevelSubjectController(BaseController):
    serializer_class = LevelSubjectSerializer
    service_class = LevelSubjectService
