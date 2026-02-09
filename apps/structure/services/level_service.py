from rest_framework.exceptions import ValidationError
from apps.core.services.BaseService import BaseService
from ..models.level import Level

class LevelService(BaseService):
    model = Level

    def before_save(self, data, instance=None):
        # 0. Appel du parent (Safety Net establishment)
        data = super().before_save(data, instance)

        # 1. Vérification d'unicité (Nom + Cycle) & (Code + Cycle)
        name = data.get('name')
        short_name = data.get('short_name')
        cycle = data.get('cycle')

        # En cas d'update, on complète avec les données existantes si manquantes
        if instance:
            if not name: name = instance.name
            if not short_name: short_name = instance.short_name
            if not cycle: cycle = instance.cycle

        if cycle:
            # Check Name
            if name:
                qs_name = self.model.objects.filter(name__iexact=name, cycle=cycle)
                if instance: qs_name = qs_name.exclude(pk=instance.pk)
                if qs_name.exists():
                    raise ValidationError({
                        "name": [f"Le niveau '{name}' existe déjà dans le cycle {cycle}."]
                    })

            # Check Short Name (Code)
            if short_name:
                qs_code = self.model.objects.filter(short_name__iexact=short_name, cycle=cycle)
                if instance: qs_code = qs_code.exclude(pk=instance.pk)
                if qs_code.exists():
                    raise ValidationError({
                        "short_name": [f"Le code '{short_name}' est déjà utilisé dans le cycle {cycle}."]
                    })

        return data
