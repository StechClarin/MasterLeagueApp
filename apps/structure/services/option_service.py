from django.core.exceptions import ValidationError
from apps.core.services.BaseService import BaseService
from ..models import Option

class OptionService(BaseService):
    model = Option

    def before_save(self, data, instance=None):
        # 0. Appel du parent pour les injections d'établissement, etc.
        data = super().before_save(data, instance)

        cycle = data.get('cycle')
        if not cycle and instance:
            cycle = instance.cycle

        if cycle:
            import unicodedata

            # Normalisation du nom pour enlever les accents (ex: Collège -> college)
            def normalize_str(s):
                if not s:
                    return ""
                normalized = unicodedata.normalize('NFD', s)
                return "".join(c for c in normalized if unicodedata.category(c) != 'Mn').lower().strip()

            cycle_name_clean = normalize_str(cycle.name)
            cycle_code_clean = normalize_str(cycle.code)

            # Si le cycle n'autorise pas les options, ou si c'est le cycle "College"
            if not cycle.has_options or "college" in cycle_name_clean or "college" in cycle_code_clean:
                raise ValidationError({
                    "cycle": f"Le cycle '{cycle.name}' ne permet pas la création d'options."
                })

        # 1. Validation de l'unicité (nom + parent + cycle) au sein de l'établissement
        name = data.get('name')
        parent = data.get('parent')
        if instance:
            if name is None: name = instance.name
            if parent is None: parent = instance.parent

        est_id = data.get('establishment_id') or data.get('establishment')
        if not est_id and instance:
            est_id = instance.establishment_id

        if name:
            query = Option.objects.filter(
                establishment_id=est_id,
                name__iexact=name,
                parent=parent,
                cycle=cycle
            )
            if instance and instance.pk:
                query = query.exclude(pk=instance.pk)

            if query.exists():
                parent_str = f" sous la filière parent '{parent.name}'" if parent else ""
                cycle_str = f" pour le cycle '{cycle.name}'" if cycle else ""
                raise ValidationError({
                    "name": f"Une filière nommée '{name}' existe déjà{parent_str}{cycle_str}."
                })

        # 2. Validation de l'unicité du code au sein de l'établissement
        code = data.get('code')
        if instance and code is None:
            code = instance.code

        if code:
            query_code = Option.objects.filter(
                establishment_id=est_id,
                code__iexact=code
            )
            if instance and instance.pk:
                query_code = query_code.exclude(pk=instance.pk)

            if query_code.exists():
                raise ValidationError({
                    "code": f"Le code '{code}' est déjà utilisé par une autre filière."
                })

        return data
