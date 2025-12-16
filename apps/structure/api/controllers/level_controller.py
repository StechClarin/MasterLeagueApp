from apps.core.api.controllers.BaseController import BaseController
from ..serializers.level_serializer import LevelSerializer
from ...services.level_service import LevelService

class LevelController(BaseController):
    serializer_class = LevelSerializer
    service_class = LevelService
