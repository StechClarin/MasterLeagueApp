from apps.core.services.BaseService import BaseService
from ..models import EvaluationSubject, EvaluationPlanning

class EvaluationSubjectService(BaseService):
    model = EvaluationSubject

    def before_save(self, data, instance=None):
        data = super().before_save(data, instance)
        
        # Automatically populate levels from classrooms if classrooms are present
        classroom_ids = data.get('classrooms', [])
        if classroom_ids:
            from apps.structure.models import ClassRoom
            level_ids = list(ClassRoom.objects.filter(id__in=classroom_ids).values_list('level_id', flat=True).distinct())
            data['levels'] = level_ids
            
        return data


    def after_save(self, instance, created):
        """
        Sauvegarde récursive des plannings (EvaluationPlanning).
        """
        plannings_data = getattr(self, 'initial_data', {}).get('plannings', [])
        if not plannings_data:
            return

        from .evaluation_planning_service import EvaluationPlanningService
        planning_service = EvaluationPlanningService()
        planning_service.set_context(getattr(self, 'user', None), instance.establishment_id)

        # Nettoyage des plannings supprimés
        sent_ids = [p.get('id') for p in plannings_data if p.get('id')]
        instance.plannings.exclude(id__in=sent_ids).delete()

        for p_data in plannings_data:
            p_copy = dict(p_data)
            p_copy['evaluation_subject_id'] = instance.id
            if 'evaluation_subject' in p_copy: p_copy.pop('evaluation_subject')
            
            
            # Clean up empty strings for nullable fields
            if p_copy.get('start_time') == "":
                p_copy['start_time'] = None
            if p_copy.get('duration_minutes') == "":
                p_copy['duration_minutes'] = None
            
            p_instance = None
            if p_copy.get('id'):
                p_instance = EvaluationPlanning.objects.filter(id=p_copy['id']).first()
            
            planning_service.save(p_copy, instance=p_instance)
