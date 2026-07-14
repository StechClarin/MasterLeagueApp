from apps.core.services.BaseService import BaseService
from ..models.academic_year import AcademicYear

class AcademicYearService(BaseService):
    model = AcademicYear

    def before_validate(self, data, instance=None):
        # 0. Appel du parent pour injection automatique de l'établissement
        data = super().before_validate(data, instance)
        
        est_id = data.get('establishment_id') or data.get('establishment')
        
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        # Conversion sécurisée en objets date pour comparaison
        from datetime import datetime, date
        def parse_date(d):
            if not d:
                return None
            if isinstance(d, (date, datetime)):
                return d
            if isinstance(d, str):
                # Supporter YYYY-MM-DD et DD/MM/YYYY
                for fmt in ("%Y-%m-%d", "%d/%m/%Y"):
                    try:
                        return datetime.strptime(d, fmt).date()
                    except ValueError:
                        continue
            return None
            
        parsed_start = parse_date(start_date)
        parsed_end = parse_date(end_date)
        
        # 1. Validation de la chronologie des dates
        self.validate_chronological_dates(parsed_start, parsed_end)
        
        # 2. Validation du non-chevauchement des dates
        self.validate_no_date_overlap(
            parsed_start, parsed_end, 
            establishment_id=est_id, instance=instance,
            message="Les dates saisies chevauchent une autre année scolaire existante."
        )
        
        # 3. Validation de l'unicité du nom
        self.validate_uniqueness(
            establishment_id=est_id, instance=instance,
            name=data.get('name'),
            message=f"Une année scolaire nommée '{data.get('name')}' existe déjà dans cet établissement."
        )
        
        return data

    def save_process(self, data, instance=None):
        # 1. Cohérence des états : Une année archivée ne peut pas être active
        is_archived = data.get('is_archived', False)
        if is_archived:
            data['is_active'] = False
            if instance:
                instance.is_active = False

        # 2. Vérification de la logique "Active"
        is_active = data.get('is_active', False)
        establishment = data.get('establishment') or data.get('establishment_id') 
        
        # Si on est en modification, on récupère l'établissement de l'instance si pas dans data
        if instance and not establishment:
            establishment = instance.establishment

        # Si cette année devient active, on désactive les autres de ce même établissement
        if is_active and establishment:
            print(f"DEBUG: Activating AcademicYear for Establishment: {establishment} (ID: {getattr(establishment, 'id', establishment)})")
            updated_count = AcademicYear.objects.filter(
                establishment=establishment, 
                is_active=True
            ).exclude(pk=instance.pk if instance else None).update(is_active=False)
            print(f"DEBUG: Deactivated {updated_count} other years for this establishment.")

        # 3. Sauvegarde standard
        return super().save_process(data, instance)

    def before_status(self, instance):
        """
        Hook appelé avant le basculement de statut (is_active) via le contrôleur (Hamburger menu).
        """
        # Si l'instance va passer à active (c.-à-d. qu'elle était inactive)
        if not instance.is_active:
            # Une année active ne peut pas être archivée
            instance.is_archived = False
            
            # On désactive toutes les autres années actives pour cet établissement
            updated_count = AcademicYear.objects.filter(
                establishment=instance.establishment,
                is_active=True
            ).exclude(pk=instance.pk).update(is_active=False)
            print(f"DEBUG: Hamburger Activation: Deactivated {updated_count} other years for Establishment {instance.establishment.id}")
