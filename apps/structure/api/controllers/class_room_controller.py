from apps.core.api.controllers.BaseController import BaseController
from ..serializers.classroom_serializer import ClassRoomSerializer
from ...services.classroom_service import ClassRoomService

class ClassRoomController(BaseController):
    serializer_class = ClassRoomSerializer
    service_class = ClassRoomService
