from django.core.exceptions import ValidationError
from apps.core.services.BaseService import BaseService
from ..models.stock_item import StockItem

class StockItemService(BaseService):
    model = StockItem

    def before_save(self, data, instance=None):
        data = super().before_save(data, instance)

        name = data.get('name')
        quantity = data.get('quantity')
        min_threshold = data.get('min_threshold')

        if instance:
            if name is None: name = instance.name
            if quantity is None: quantity = instance.quantity
            if min_threshold is None: min_threshold = instance.min_threshold

        est_id = data.get('establishment_id') or data.get('establishment')
        if not est_id and instance:
            est_id = instance.establishment_id

        # Validation de l'unicité du nom de l'article dans l'établissement
        if name:
            self.validate_uniqueness(
                establishment_id=est_id,
                instance=instance,
                field_name='name',
                message=f"Un article de stock nommé '{name}' existe déjà.",
                name=name
            )

        # Validation de la quantité positive ou nulle
        if quantity is not None and quantity < 0:
            raise ValidationError({
                "quantity": "La quantité en stock ne peut pas être négative."
            })

        # Validation du seuil minimum
        if min_threshold is not None and min_threshold < 0:
            raise ValidationError({
                "min_threshold": "Le seuil d'alerte ne peut pas être négatif."
            })

        return data
