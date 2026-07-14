from django.core.exceptions import ValidationError
from apps.core.services.BaseService import BaseService
from ..models import AcademicPeriod
from ..models.academic_year import AcademicYear

class AcademicPeriodService(BaseService):
    model = AcademicPeriod

    def before_save(self, data, instance=None):
        # 0. Appel du parent pour injecter establishment_id, etc.
        data = super().before_save(data, instance)

        name = data.get('name')
        academic_year = data.get('academic_year')
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        # En cas d'update, on complète avec les données existantes si non fournies
        if instance:
            if name is None: name = instance.name
            if academic_year is None: academic_year = instance.academic_year
            if start_date is None: start_date = instance.start_date
            if end_date is None: end_date = instance.end_date

        # Conversion en objets date pour comparaison
        from datetime import datetime, date
        def parse_date(d):
            if not d: return None
            if isinstance(d, (date, datetime)): return d
            if isinstance(d, str):
                for fmt in ("%Y-%m-%d", "%d/%m/%Y"):
                    try:
                        return datetime.strptime(d, fmt).date()
                    except ValueError:
                        continue
            return None

        parsed_start = parse_date(start_date)
        parsed_end = parse_date(end_date)

        # 1. Validation de la chronologie des dates (début < fin)
        self.validate_chronological_dates(parsed_start, parsed_end)

        # 2. Validation d'unicité du nom au sein de l'année académique
        est_id = data.get('establishment_id') or data.get('establishment')
        if not est_id and instance:
            est_id = instance.establishment_id

        if name and academic_year:
            # Résolution de l'ID de l'année académique
            ay_id = academic_year.id if hasattr(academic_year, 'id') else academic_year
            self.validate_uniqueness(
                establishment_id=est_id,
                instance=instance,
                field_name='name',
                message=f"Une période nommée '{name}' existe déjà pour cette année académique.",
                name=name,
                academic_year_id=ay_id
            )

        # 3. Validation de l'inclusion des dates de la période dans celles de l'année académique
        if academic_year and parsed_start and parsed_end:
            ay_instance = academic_year if hasattr(academic_year, 'start_date') else AcademicYear.objects.filter(id=academic_year).first()
            if ay_instance:
                ay_start = parse_date(ay_instance.start_date)
                ay_end = parse_date(ay_instance.end_date)
                
                if ay_start and parsed_start < ay_start:
                    raise ValidationError({
                        "start_date": f"La date de début ({parsed_start}) ne peut pas être antérieure à la date de début de l'année académique ({ay_start})."
                    })
                if ay_end and parsed_end > ay_end:
                    raise ValidationError({
                        "end_date": f"La date de fin ({parsed_end}) ne peut pas être postérieure à la date de fin de l'année académique ({ay_end})."
                    })

        # 4. Validation du non-chevauchement des dates au sein de l'année académique
        if academic_year and parsed_start and parsed_end:
            ay_id = academic_year.id if hasattr(academic_year, 'id') else academic_year
            self.validate_no_date_overlap(
                parsed_start, parsed_end,
                establishment_id=est_id,
                instance=instance,
                extra_filters={'academic_year_id': ay_id},
                message="Les dates de cette période chevauchent une autre période de la même année académique."
            )

        # 5. Cohérence de l'état actif (une seule active à la fois par établissement/année académique)
        is_active = data.get('is_active', False)
        if is_active and academic_year:
            ay_id = academic_year.id if hasattr(academic_year, 'id') else academic_year
            updated_count = AcademicPeriod.objects.filter(
                establishment_id=est_id,
                academic_year_id=ay_id,
                is_active=True
            ).exclude(pk=instance.pk if instance else None).update(is_active=False)
            print(f"DEBUG: Deactivated {updated_count} other active periods.")

        return data

    def before_status(self, instance):
        """ Hook appelé avant le basculement de statut via le hamburger menu """
        if not instance.is_active:
            # On va activer cette période, donc on désactive toutes les autres de la même année académique
            updated_count = AcademicPeriod.objects.filter(
                establishment=instance.establishment,
                academic_year=instance.academic_year,
                is_active=True
            ).exclude(pk=instance.pk).update(is_active=False)
            print(f"DEBUG: Hamburger activation: Deactivated {updated_count} other periods for Year {instance.academic_year_id}")

