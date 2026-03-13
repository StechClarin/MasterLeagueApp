from apps.core.services.BaseService import BaseService
from ..models import EvaluationSession, EvaluationSubject, EvaluationSupervision

class EvaluationSessionService(BaseService):
    model = EvaluationSession

    def before_validate(self, data, instance=None):
        import json
        if hasattr(data, 'dict'):
             data = data.dict()
        elif hasattr(data, 'copy'):
             data = data.copy()

        json_fields = ['selectedLevels', 'selectedClassrooms', 'subjects', 'supervisions']
        for field in json_fields:
            if field in data and isinstance(data[field], str):
                try:
                    data[field] = json.loads(data[field])
                except json.JSONDecodeError:
                    pass

        data = super().before_validate(data, instance)
        return data

    def before_save(self, data, instance=None):
        data = super().before_save(data, instance)
        return data

    def after_save(self, instance, created):
        """
        Sauvegarde récursive des épreuves (EvaluationSubject) et des supervisions.
        """
        subjects_data = getattr(self, 'initial_data', {}).get('subjects', [])
        supervisions_data = getattr(self, 'initial_data', {}).get('supervisions', [])

        # 1. Gestion des Épreuves
        from .evaluation_subject_service import EvaluationSubjectService
        subject_service = EvaluationSubjectService()
        subject_service.set_context(getattr(self, 'user', None), instance.establishment_id)

        sent_subject_ids = [s.get('id') for s in subjects_data if s.get('id')]
        instance.subjects.exclude(id__in=sent_subject_ids).delete()

        for index, s_data in enumerate(subjects_data):
            s_data_copy = dict(s_data)
            s_data_copy['session_id'] = instance.id
            if 'session' in s_data_copy: s_data_copy.pop('session')
            if s_data_copy.get('subject') and not isinstance(s_data_copy['subject'], dict):
                s_data_copy['subject_id'] = s_data_copy.pop('subject')
            
            # Extract plannings to pass via initial_data
            plannings = s_data_copy.pop('plannings', [])
            
            # Remove reverse generic arrays like files that crash create
            s_data_copy.pop('subjectFiles', None)
            s_data_copy.pop('subjectFile', None) # if populated incorrectly

            # Extraire le fichier déposé via le FormData global (nouveau mécanisme Angular)
            subject_file = getattr(self, 'initial_data', {}).get(f'subject_file_{index}')
            if subject_file:
                s_data_copy['subject_file'] = subject_file

            s_instance = None
            if s_data_copy.get('id'):
                s_instance = EvaluationSubject.objects.filter(id=s_data_copy['id']).first()
            
            subject_service.initial_data = {'plannings': plannings}
            subject_service.save(s_data_copy, instance=s_instance)

        # 2. Gestion des Supervisions
        from .evaluation_supervision_service import EvaluationSupervisionService
        supervision_service = EvaluationSupervisionService()
        supervision_service.set_context(getattr(self, 'user', None), instance.establishment_id)

        sent_supervision_ids = [sup.get('id') for sup in supervisions_data if sup.get('id')]
        instance.supervisions.exclude(id__in=sent_supervision_ids).delete()

        for sup_data in supervisions_data:
            sup_copy = dict(sup_data)
            sup_copy['session_id'] = instance.id
            if 'session' in sup_copy: sup_copy.pop('session')
            if sup_copy.get('classroom') and not isinstance(sup_copy['classroom'], dict):
                sup_copy['classroom_id'] = sup_copy.pop('classroom')
            
            # Clean up empty date strings
            if sup_copy.get('date') == "":
                sup_copy['date'] = None

            sup_instance = None
            if sup_copy.get('id'):
                sup_instance = EvaluationSupervision.objects.filter(id=sup_copy['id']).first()
            supervision_service.save(sup_copy, instance=sup_instance)
