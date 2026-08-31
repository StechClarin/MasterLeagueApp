from django.core.exceptions import ValidationError
from apps.core.services.BaseService import BaseService
from apps.finance.models import Expense
from datetime import date


class ExpenseService(BaseService):
    model = Expense

    def before_validate(self, data, instance=None):
        data = super().before_validate(data, instance)

        # Génération automatique de la référence si absente (création uniquement)
        if not instance and not data.get('reference'):
            data['reference'] = self.generate_reference(
                data.get('establishment') or data.get('establishment_id')
            )
        return data

    def before_save(self, data, instance=None):
        data = super().before_save(data, instance)
        return data

    def generate_reference(self, establishment_id=None):
        """Génère une référence unique de type DEP-<année>-<séquence>."""
        year = date.today().year
        prefix = f"DEP-{year}-"

        last = self.model.objects.filter(
            reference__startswith=prefix,
            establishment_id=establishment_id,
        ).order_by('-reference').first()

        seq = 1
        if last and last.reference:
            try:
                seq = int(last.reference.split('-')[-1]) + 1
            except (ValueError, IndexError):
                pass

        return f"{prefix}{seq:04d}"
