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
            if instance.is_closed:
                # Si la période est clôturée, on empêche les modifications via save
                # sauf si on demande explicitement de la réouvrir (is_closed=False)
                if data.get('is_closed', True):
                    raise ValidationError({
                        "non_field_errors": "Cette période est clôturée et ne peut plus être modifiée."
                    })
            if name is None: name = instance.name
            if academic_year is None: academic_year = instance.academic_year
            if start_date is None: start_date = instance.start_date
            if end_date is None: end_date = instance.end_date

        # Extraction et validation des cycles concernés
        cycles = data.get('cycles')
        if cycles is None and instance:
            cycle_ids = list(instance.cycles.values_list('id', flat=True))
        else:
            cycle_ids = []
            if cycles:
                for c in cycles:
                    if hasattr(c, 'id'):
                        cycle_ids.append(c.id)
                    else:
                        cycle_ids.append(c)
        
        if not cycle_ids:
            raise ValidationError({
                "cycles": "Vous devez sélectionner au moins un cycle pour cette période."
            })

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

        # 4. Validation du non-chevauchement des dates au sein de l'année académique (par cycle)
        if academic_year and parsed_start and parsed_end:
            ay_id = academic_year.id if hasattr(academic_year, 'id') else academic_year
            self.validate_no_date_overlap(
                parsed_start, parsed_end,
                establishment_id=est_id,
                instance=instance,
                extra_filters={
                    'academic_year_id': ay_id,
                    'cycles__in': cycle_ids
                },
                field_name='start_date',
                message="Les dates de cette période chevauchent une autre période du même cycle pour cette année académique."
            )

        # 5. Cohérence de l'état actif (une seule active à la fois par cycle/établissement/année académique)
        is_active = data.get('is_active', False)
        if is_active and academic_year:
            ay_id = academic_year.id if hasattr(academic_year, 'id') else academic_year
            # On cherche toutes les autres périodes actives qui partagent au moins un cycle
            other_active_periods = AcademicPeriod.objects.filter(
                establishment_id=est_id,
                academic_year_id=ay_id,
                is_active=True,
                cycles__in=cycle_ids
            ).exclude(pk=instance.pk if instance else None).distinct()
            
            # Désactivation réactive
            for op in other_active_periods:
                op.is_active = False
                op.save()
            print(f"DEBUG: Deactivated {len(other_active_periods)} other active periods sharing cycles.")

        return data

    def before_status(self, instance):
        """ Hook appelé avant le basculement de statut via le hamburger menu """
        if not instance.is_active:
            # On va activer cette période, donc on désactive toutes les autres de la même année académique qui partagent au moins un cycle
            cycle_ids = list(instance.cycles.values_list('id', flat=True))
            other_active_periods = AcademicPeriod.objects.filter(
                establishment=instance.establishment,
                academic_year=instance.academic_year,
                is_active=True,
                cycles__in=cycle_ids
            ).exclude(pk=instance.pk).distinct()
            
            for op in other_active_periods:
                op.is_active = False
                op.save()
            print(f"DEBUG: Hamburger activation: Deactivated {len(other_active_periods)} other periods sharing cycles.")

    def close(self, pk):
        """
        Définit is_closed = True et is_active = False pour verrouiller la période.
        """
        instance = self.get_by_id(pk)
        instance.is_closed = True
        instance.is_active = False
        instance.save()
        return instance

    def reopen(self, pk):
        """
        Définit is_closed = False et is_active = True.
        Gère les règles d'exclusivité par cycle.
        """
        instance = self.get_by_id(pk)
        instance.is_closed = False
        instance.is_active = True
        
        # Désactiver les autres périodes actives sur les mêmes cycles
        self.before_status(instance)
        
        instance.save()
        return instance

