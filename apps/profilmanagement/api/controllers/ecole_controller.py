from apps.core.api.controllers import BaseController
from ...services.ecole_service import EcoleService
from ..serializers.ecole_serializer import EcoleSerializer

class EcoleController(BaseController):
    serializer_class = EcoleSerializer
    service_class = EcoleService
