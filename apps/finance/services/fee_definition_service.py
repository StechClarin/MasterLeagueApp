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
        """
        from apps.students.models import Enrollment
        from apps.finance.services.finance_service import FinanceService
        from django.db.models import Q

        # 1. Identifier les inscriptions cibles
        enrollments = Enrollment.objects.filter(
            classroom__level=fee.level,
            academic_year=fee.academic_year,
            establishment=fee.establishment,
            status='REGISTERED'
        )

        # 2. Filtrer par ciblage spécifique si nécessaire
        if fee.classrooms.exists():
            enrollments = enrollments.filter(classroom__in=fee.classrooms.all())
        
        # Note: Si fee.students est défini (M2M), on filtrera dans la boucle 
        # ou via une requête complexe. Plus simple ici : filtrer dans la boucle.
        
        specific_students_ids = list(fee.students.values_list('id', flat=True))

        for enrollment in enrollments:
            # Si le tarif cible des élèves précis, vérifier si celui-ci en fait partie
            if specific_students_ids and enrollment.student_id not in specific_students_ids:
                continue
                
            # Appeler le moteur de facturation pour cette inscription
            # generate_invoices_for_enrollment vérifie déjà l'existence pour éviter les doublons
            FinanceService.generate_invoices_for_enrollment(enrollment)
