# apps/core/api/controllers/establishment_membership_controller.py
from apps.core.api.controllers.BaseController import BaseController
from ..serializers.establishment_membership_serializer import EstablishmentMembershipSerializer
from ...services.establishment_membership_service import EstablishmentMembershipService

class EstablishmentMembershipController(BaseController):
    serializer_class = EstablishmentMembershipSerializer
    service_class = EstablishmentMembershipService
