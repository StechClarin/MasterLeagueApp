from rest_framework import status
from apps.core.api.controllers.BaseController import BaseController
from apps.finance.models import FeeDefinition
from apps.finance.api.serializers.finance_serializer import FeeDefinitionSerializer
from apps.finance.services.fee_definition_service import FeeDefinitionService

class FeeDefinitionController(BaseController):
    serializer_class = FeeDefinitionSerializer
    service_class = FeeDefinitionService
