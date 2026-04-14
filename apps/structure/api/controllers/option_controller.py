from apps.core.api.controllers.BaseController import BaseController
from ..serializers.option_serializer import OptionSerializer
from ...services.option_service import OptionService

class OptionController(BaseController):
    serializer_class = OptionSerializer
    service_class = OptionService
