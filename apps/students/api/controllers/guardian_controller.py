from apps.core.api.controllers.BaseController import BaseController
from ..serializers.guardian_serializer import GuardianSerializer
from ...services.guardian_service import GuardianService

class GuardianController(BaseController):
    serializer_class = GuardianSerializer
    service_class = GuardianService
