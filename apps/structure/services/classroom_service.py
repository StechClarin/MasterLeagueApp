from apps.core.services.BaseService import BaseService
from ..models.classroom import ClassRoom

from ..models.academic_year import AcademicYear
from django.core.exceptions import ValidationError

class ClassRoomService(BaseService):
    model = ClassRoom

    def before_validate(self, data, instance=None):
        # 0. Appel du parent pour l'injection standard (ex: establishment_id)
        data = super().before_validate(data, instance)

        # 1. Vérification si l'année académique est fournie
        # (NB: DRF passe parfois des IDs ou des instances, selon le Serializer)
        if 'academic_year' not in data and 'academic_year_id' not in data:
            
            # 2. Récupération de l'année active par défaut pour l'établissement courant
            if hasattr(self, 'establishment_id') and self.establishment_id:
                active_year = AcademicYear.objects.filter(
                    establishment_id=self.establishment_id, 
                    is_active=True
                ).first()

                if active_year:
                    # On injecte l'ID (ou l'instance si le Serializer le gère, mais l'ID est plus sûr pour les FK simples)
                    # Si c'est un create via DRF serializer.save(), data est souvent nettoyé. 
                    # DRF attend souvent l'instance pour les champs relationnels si c'est déjà validé ?? 
                    # Non, ici on est dans le Service save, appelé par le Controller.
                    # BaseService.save attend un dictionnaire de données validées (souvent par Serializer).
                    # SI c'est appelé APRES validation Serializer (via serializer.validated_data), alors 'academic_year' devrait déjà être là ou absent.
                    # Si le serializer a ignoré le champ car read_only ou absent, on l'ajoute.
                    
                    data['academic_year'] = active_year.id # Utiliser l'ID pour être sûr que le Serializer le mange bien si c'est du raw data
                else:
                    raise ValidationError("Aucune année académique active trouvée pour cet établissement.")
        
        return data

    def before_save(self, data, instance=None):
        # 0. Appel du parent pour injection standard
        data = super().before_save(data, instance)

        name = data.get('name')
        level = data.get('level')
        academic_year = data.get('academic_year')
        option = data.get('option')
        capacity = data.get('capacity')

        if instance:
            if name is None: name = instance.name
            if level is None: level = instance.level
            if academic_year is None: academic_year = instance.academic_year
            if option is None and 'option' not in data: option = instance.option
            if capacity is None: capacity = instance.capacity

        # 1. Validation de l'unicité du nom de classe pour un niveau et une année scolaire donnés
        if name and level and academic_year:
            # Résolution propre des IDs ou instances
            level_id = level.id if hasattr(level, 'id') else level
            academic_year_id = academic_year.id if hasattr(academic_year, 'id') else academic_year

            query = ClassRoom.objects.filter(
                name__iexact=name,
                level_id=level_id,
                academic_year_id=academic_year_id
            )
            if instance and instance.pk:
                query = query.exclude(pk=instance.pk)

            if query.exists():
                raise ValidationError({
                    "name": f"Une classe nommée '{name}' existe déjà pour ce niveau et cette année académique."
                })

        # 2. Validation de la capacité positive
        if capacity is not None and capacity <= 0:
            raise ValidationError({
                "capacity": "La capacité de la classe doit être supérieure à 0."
            })

        # 3. Validation de cohérence de l'option vis-à-vis du niveau et de son cycle
        if level:
            # Obtenir l'objet level complet si on a uniquement son ID
            if not hasattr(level, 'cycle'):
                level = Level.objects.filter(id=level).first()

            if level:
                cycle = level.cycle
                if cycle:
                    import unicodedata

                    # Normalisation pour détecter "college"
                    def normalize_str(s):
                        if not s:
                            return ""
                        normalized = unicodedata.normalize('NFD', s)
                        return "".join(c for c in normalized if unicodedata.category(c) != 'Mn').lower().strip()

                    cycle_name_clean = normalize_str(cycle.name)
                    cycle_code_clean = normalize_str(cycle.code)

                    # Si l'option est spécifiée alors que le cycle ne le permet pas
                    if option:
                        if not cycle.has_options or "college" in cycle_name_clean or "college" in cycle_code_clean:
                            raise ValidationError({
                                "option": f"Le cycle '{cycle.name}' du niveau '{level.name}' n'autorise pas la sélection d'options."
                            })

                        # Si l'option a elle-même un cycle, il doit être cohérent avec celui du niveau
                        option_cycle_id = option.cycle.id if hasattr(option, 'cycle') and option.cycle else getattr(option, 'cycle_id', None)
                        if option_cycle_id and option_cycle_id != cycle.id:
                            raise ValidationError({
                                "option": f"L'option choisie ne correspond pas au cycle '{cycle.name}' du niveau."
                            })

        return data

