from django.db import transaction
from django.core.exceptions import ValidationError
from apps.core.services.BaseService import BaseService
from ..models import Grade, EvaluationSubject
from apps.students.models import Student

class GradeService(BaseService):
    model = Grade

    def bulk_save(self, evaluation_id, grades_data):
        """
        Sauvegarde massive des notes pour une session.
        """
        from ..models import EvaluationSession

        results = {
            "created": 0,
            "updated": 0,
            "errors": []
        }
        
        # 1. Récupérer la session pour valider le contexte (Etablissement & Année Académique)
        try:
            session = EvaluationSession.objects.get(id=evaluation_id)
        except EvaluationSession.DoesNotExist:
            raise ValidationError(f"Session d'évaluation {evaluation_id} introuvable.")

        # Sécurité : Utiliser l'id de l'établissement de la session si non présent dans le service
        context_est_id = self.establishment_id or session.establishment_id

        # Validation : Uniquement sur l'année académique active
        if not session.academic_period.academic_year.is_active:
            raise ValidationError("Impossible de modifier les notes d'une année académique archivée ou inactive.")

        with transaction.atomic():
            for g_data in grades_data:
                student_id = g_data.get('student')
                eval_subject_id = g_data.get('evaluation_subject')
                value = g_data.get('value')
                is_absent = g_data.get('is_absent', False)
                comment = g_data.get('comment', '')
                
                if not student_id or not eval_subject_id:
                    continue
                
                # Check if grade exists
                grade = Grade.objects.filter(
                    student_id=student_id, 
                    evaluation_subject_id=eval_subject_id,
                    establishment_id=context_est_id
                ).first()
                
                if grade:
                    grade.value = value
                    grade.absence_status = 'UNJUSTIFIED' if is_absent else 'NONE'
                    grade.comment = comment
                    grade.save()
                    results["updated"] += 1
                else:
                    Grade.objects.create(
                        student_id=student_id,
                        evaluation_subject_id=eval_subject_id,
                        value=value,
                        absence_status='UNJUSTIFIED' if is_absent else 'NONE',
                        comment=comment,
                        establishment_id=context_est_id
                    )
                    results["created"] += 1
                    
        return results
