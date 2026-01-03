from apps.core.api.controllers.BaseController import BaseController
from ..serializers.contract_type_serializer import ContractTypeSerializer
from ...services.contract_type_service import ContractTypeService

class ContractTypeController(BaseController):
    serializer_class = ContractTypeSerializer
    service_class = ContractTypeService
