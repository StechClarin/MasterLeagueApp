from django.core.exceptions import ValidationError
from apps.core.services.BaseService import BaseService
from ..models.cycle import Cycle

class CycleService(BaseService):
    model = Cycle

    def before_save(self, data, instance=None):
        # 0. Appel du parent pour injection/validation de l'établissement
        data = super().before_save(data, instance)

        est_id = data.get('establishment_id') or data.get('establishment')
        if not est_id and instance:
            est_id = instance.establishment_id

        name = data.get('name')
        order = data.get('order')

        # En cas d'update, on complète avec les données de l'instance si manquantes
        if instance:
            if name is None: name = instance.name
            if order is None: order = instance.order

        # 1. Validation du nom unique dans l'établissement
        if name is not None:
            self.validate_uniqueness(
                establishment_id=est_id,
                instance=instance,
                field_name='name',
                message=f"Un cycle nommé '{name}' existe déjà dans cet établissement.",
                name=name
            )

        # 2. Validation de l'ordre unique dans l'établissement
        if order is not None:
            self.validate_uniqueness(
                establishment_id=est_id,
                instance=instance,
                field_name='order',
                message=f"Un cycle avec l'ordre {order} existe déjà dans cet établissement.",
                order=order
            )

        return data
