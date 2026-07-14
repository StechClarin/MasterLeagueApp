from django.core.exceptions import ValidationError
from apps.core.services.BaseService import BaseService
from ..models import Room

class RoomService(BaseService):
    model = Room

    def before_save(self, data, instance=None):
        # 0. Appel du parent pour injection d'établissement, etc.
        data = super().before_save(data, instance)

        name = data.get('name')
        capacity = data.get('capacity')

        if instance:
            if name is None: name = instance.name
            if capacity is None: capacity = instance.capacity

        est_id = data.get('establishment_id') or data.get('establishment')
        if not est_id and instance:
            est_id = instance.establishment_id

        # 1. Validation de l'unicité du nom de la salle dans l'établissement
        if name:
            self.validate_uniqueness(
                establishment_id=est_id,
                instance=instance,
                field_name='name',
                message=f"Une salle nommée '{name}' existe déjà dans cet établissement.",
                name=name
            )

        # 2. Validation de la capacité positive
        if capacity is not None and capacity <= 0:
            raise ValidationError({
                "capacity": "La capacité de la salle doit être supérieure à 0."
            })

        return data

