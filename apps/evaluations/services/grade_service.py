from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ValidationError
from apps.core.services.BaseService import BaseService
from ..models import Grade, EvaluationSubject


class GradeService(BaseService):
    model = Grade

    def save_portal_grades(self, data):
        """
        Sauvegarde par lot des notes issues du portail.
        Délègue l'écriture à BaseService.save_bulk pour assurer la cohérence et l'audit.
        """
        eval_subject_id = data.get("evaluation_subject_id")
        grades_list = data.get("grades", [])

        if not eval_subject_id:
            eval_id = data.get("evaluation_session_id") or data.get("evaluation_id")
            sub_id = data.get("subject_id")
            if eval_id and sub_id:
                es = EvaluationSubject.objects.filter(
                    session_id=eval_id, 
                    subject_id=sub_id, 
                    is_deleted=False
                ).first()
                if not es and self.establishment_id:
                    es = EvaluationSubject.objects.create(
                        session_id=eval_id,
                        subject_id=sub_id,
                        establishment_id=self.establishment_id,
                        max_score=Decimal("20.0"),
                    )
                if es:
                    eval_subject_id = str(es.pk)

        if not eval_subject_id:
            raise ValidationError("Veuillez préciser l'évaluation et la matière pour enregistrer les notes.")

        batch_payload = []
        for item in grades_list:
            student_id = item.get("student_id") or item.get("student")
            grade_val = item.get("grade") if "grade" in item else item.get("value")
            comment = item.get("comment", "")
            absence_status = item.get("absence_status", "NONE")

            if not student_id:
                continue

            val_decimal = Decimal(str(grade_val)) if grade_val is not None and grade_val != "" else None

            payload = {
                "student_id": student_id,
                "evaluation_subject_id": eval_subject_id,
                "value": val_decimal,
                "comment": comment,
                "absence_status": absence_status,
            }
            if self.establishment_id:
                payload["establishment_id"] = self.establishment_id
            batch_payload.append(payload)

        # Utilisation de la méthode générique save_bulk de BaseService
        saved_items = self.save_bulk(
            data_list=batch_payload,
            lookup_fields=["student_id", "evaluation_subject_id"]
        )

        return {
            "success": True,
            "message": f"{len(saved_items)} notes enregistrées avec succès.",
            "count": len(saved_items),
        }

    def bulk_save(self, evaluation_id, grades_data):
        """
        Méthode historique de sauvegarde massive.
        """
        return self.save_portal_grades({
            "evaluation_session_id": evaluation_id,
            "grades": grades_data,
        })
