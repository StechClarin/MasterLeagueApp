from apps.core.api.controllers.BaseController import BaseController
from ..serializers.establishment_serializer import EstablishmentSerializer
from ...services.establishment_service import EstablishmentService

class EstablishmentController(BaseController):
    serializer_class = EstablishmentSerializer
    service_class = EstablishmentService
