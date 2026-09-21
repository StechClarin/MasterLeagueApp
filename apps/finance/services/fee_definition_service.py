from apps.core.services.BaseService import BaseService
from apps.finance.models import FeeDefinition

class FeeDefinitionService(BaseService):
    model = FeeDefinition
    export_fields = ['name', 'category', 'amount', 'level__name', 'academic_year__name', 'is_active']
    import_fields = [
        'name', 
        'category', 
        'amount', 
        {'level': {'model': 'structure.Level', 'search_field': 'name'}},
        {'academic_year': {'model': 'structure.AcademicYear', 'search_field': 'name'}},
        'is_active'
    ]

    def before_save(self, data, instance=None):
        """
        Intercepte le flag de rétro-application et valide l'unicité globale des tarifs.
        """
        self._apply_to_existing = data.pop('apply_to_existing', False)
        
        # Validation d'unicité intelligente pour les tarifs GLOBAUX
        students_ids = data.get('students_ids') or data.get('students') or []
        classrooms_ids = data.get('classrooms_ids') or data.get('classrooms') or []
        option_id = data.get('option_id') or data.get('option')
        level_id = data.get('level_id') or data.get('level')
        category = data.get('category')
        academic_year_id = data.get('academic_year_id') or data.get('academic_year')
        establishment = data.get('establishment') or getattr(self, 'establishment', None)

        if not students_ids and not classrooms_ids and not option_id and level_id and category and academic_year_id:
            query = FeeDefinition.objects.filter(
                level_id=level_id,
                option__isnull=True,
                category=category,
                academic_year_id=academic_year_id,
                students__isnull=True,
                classrooms__isnull=True
            )
            if establishment:
                query = query.filter(establishment=establishment)
            if instance:
                query = query.exclude(pk=instance.pk)
            if query.exists():
                from rest_framework.exceptions import ValidationError
                raise ValidationError({"non_field_errors": [f"Un tarif global pour cette catégorie ({category}) existe déjà pour ce niveau scolaire."]})

        # Harmonisation monétaire des tranches en entiers (FCFA)
        custom_installments = data.get('custom_installments')
        if custom_installments and isinstance(custom_installments, list):
            formatted_installments = []
            for item in custom_installments:
                formatted_installments.append({
                    'tranche': item.get('tranche'),
                    'amount': int(round(float(item.get('amount', 0)))),
                    'due_date': item.get('due_date') or item.get('dueDate') or None
                })
            data['custom_installments'] = formatted_installments

        return super().before_save(data, instance)


    def after_save(self, instance, created):
        """
        Déclenché après l'enregistrement d'un tarif.
        Permet de rétro-appliquer le tarif aux élèves déjà inscrits si demandé.
        """
        if getattr(self, '_apply_to_existing', False):
            self.apply_to_existing_enrollments(instance)
        return instance

    def status(self, pk):
        """
        Surcharge du status pour servir de déclencheur à la rétro-application.
        """
        instance = self.get_by_id(pk)
        self.apply_to_existing_enrollments(instance)
        return instance

    def apply_to_existing_enrollments(self, fee):
        """
        Scanne les inscriptions existantes et génère les factures manquantes.
        Ciblage par spécificité décroissante : Élèves > Classes > Option > Niveau.
        NB : on ne croise JAMAIS classroom__level avec un ciblage par classe/élève,
        car le niveau du tarif peut différer du niveau réel de la classe ciblée.
        """
        from apps.students.models import Enrollment
        from apps.finance.services.finance_service import FinanceService

        # 1. Base commune : année, établissement, statuts actifs
        # PENDING (en attente) + REGISTERED (inscrits) : les élèves en attente ont
        # besoin de la facture pour payer leurs frais et passer 'Inscrit'.
        base_kwargs = {
            'academic_year': fee.academic_year,
            'establishment': fee.establishment,
            'status__in': ['PENDING', 'REGISTERED'],
        }

        # 2. Ciblage par spécificité décroissante
        if fee.students.exists():
            enrollments = Enrollment.objects.filter(student__in=fee.students.all(), **base_kwargs)
        elif fee.classrooms.exists():
            enrollments = Enrollment.objects.filter(classroom__in=fee.classrooms.all(), **base_kwargs)
        elif fee.option_id:
            enrollments = Enrollment.objects.filter(classroom__option=fee.option, **base_kwargs)
        else:
            # Ciblage global par niveau (cas standard)
            enrollments = Enrollment.objects.filter(classroom__level=fee.level, **base_kwargs)

        # 3. Générer les factures manquantes (dédup géré par generate_invoices_for_enrollment)
        for enrollment in enrollments:
            FinanceService.generate_invoices_for_enrollment(enrollment)
