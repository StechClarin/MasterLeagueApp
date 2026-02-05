from apps.core.api.controllers.BaseController import BaseController
from ..serializers.room_serializer import RoomSerializer
from ...services.room_service import RoomService

class RoomController(BaseController):
    serializer_class = RoomSerializer
    service_class = RoomService
