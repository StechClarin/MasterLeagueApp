from apps.core.services.BaseService import BaseService
from ..models import Establishment

class EstablishmentService(BaseService):
    model = Establishment

    def after_save(self, instance, created):
        """
        Après la création d'un établissement, on crée automatiquement le membership
        pour le propriétaire (instance.user).
        """
        if created and instance.user:
            from apps.core.services.establishment_membership_service import EstablishmentMembershipService
            membership_service = EstablishmentMembershipService()
            
            membership_service.get_or_create(
                user=instance.user,
                establishment=instance,
                defaults={
                    'is_owner': True,
                    'status': 'active'
                }
            )
