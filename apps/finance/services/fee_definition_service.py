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
        Intercepte le flag de rétro-application avant l'écriture en base.
        """
        self._apply_to_existing = data.pop('apply_to_existing', False)
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
