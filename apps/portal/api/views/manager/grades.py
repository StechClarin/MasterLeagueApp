from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import JSONParser
from decimal import Decimal
from django.db.models import Q
import uuid

from apps.students.models import Student, Enrollment
from apps.structure.models import ClassRoom, Subject
from apps.evaluations.models import EvaluationSession, EvaluationSubject, Grade
from apps.evaluations.services.grade_service import GradeService
from apps.portal.api.views.utils import get_request_establishment_id


def is_valid_uuid(val):
    if not val or not isinstance(val, str):
        return False
    try:
        uuid.UUID(str(val))
        return True
    except (ValueError, TypeError, AttributeError):
        return False


class ManagerGradesView(APIView):
    """
    GET /api/portal/manager/grades/?evaluation_id=...&classroom_id=...&subject_id=...&establishment_id=...
    Filtrage en cascade :
    Examen -> Classe (seulement les classes concernées) -> Matière (seulement les matières de la classe et concernées par l'examen)
    Élèves : Seuls les élèves au statut 'REGISTERED' (Inscrit) sont renvoyés.

    POST /api/portal/manager/grades/
    Enregistre les notes par lot en utilisant GradeService (enfant de BaseService).
    """
    authentication_classes = []
    permission_classes = [AllowAny]
    parser_classes = [JSONParser]

    def get(self, request):
        est_id = get_request_establishment_id(request)
        if not is_valid_uuid(est_id):
            est_id = None

        eval_id = request.query_params.get("evaluation_id") or request.query_params.get("evaluation_session_id")
        if not is_valid_uuid(eval_id):
            eval_id = None

        classroom_id = request.query_params.get("classroom_id")
        if not is_valid_uuid(classroom_id):
            classroom_id = None

        subject_id = request.query_params.get("subject_id")
        if not is_valid_uuid(subject_id):
            subject_id = None

        # 1. SELECTION 1 : Sessions d'Évaluation (Examens)
        eval_qs = EvaluationSession.objects.filter(is_deleted=False)
        if est_id:
            eval_qs = eval_qs.filter(establishment_id=est_id)

        evaluations_data = [
            {"id": str(ev.pk), "name": ev.title or f"Évaluation {ev.pk}"}
            for ev in eval_qs.order_by("-created_at")[:50]
        ]

        active_eval_id = eval_id if any(e["id"] == eval_id for e in evaluations_data) else (evaluations_data[0]["id"] if evaluations_data else None)

        # 2. SELECTION 2 : Classes CONCERNÉES par l'Examen sélectionné
        classrooms_data = []
        concerned_classroom_qs = ClassRoom.objects.none()

        if active_eval_id:
            eval_subjects = EvaluationSubject.objects.filter(session_id=active_eval_id, is_deleted=False)
            
            # IDs des classes directement associées aux épreuves
            direct_class_ids = list(eval_subjects.values_list("classrooms", flat=True).distinct())
            direct_class_ids = [c for c in direct_class_ids if c is not None]

            # IDs des niveaux associés aux épreuves
            level_ids = list(eval_subjects.values_list("levels", flat=True).distinct())
            level_ids = [l for l in level_ids if l is not None]

            q_filter = Q()
            if direct_class_ids:
                q_filter |= Q(id__in=direct_class_ids)
            if level_ids:
                q_filter |= Q(level_id__in=level_ids)

            if q_filter:
                concerned_classroom_qs = ClassRoom.objects.filter(q_filter, is_deleted=False).distinct()
                if est_id:
                    concerned_classroom_qs = concerned_classroom_qs.filter(establishment_id=est_id)

        # Fallback si aucune restriction spécifique de classe sur les épreuves
        if not concerned_classroom_qs.exists() and est_id:
            concerned_classroom_qs = ClassRoom.objects.filter(establishment_id=est_id, is_deleted=False)

        classrooms_data = [
            {"id": str(c.pk), "name": c.name}
            for c in concerned_classroom_qs.order_by("name")
        ]

        active_class_id = classroom_id if any(c["id"] == classroom_id for c in classrooms_data) else (classrooms_data[0]["id"] if classrooms_data else None)

        # 3. SELECTION 3 : Matières de la classe sélectionnée ET concernées par cet Examen
        subjects_data = []
        eval_subject = None

        if active_eval_id and active_class_id:
            cls_obj = ClassRoom.objects.filter(pk=active_class_id).first()

            eval_sub_qs = EvaluationSubject.objects.filter(session_id=active_eval_id, is_deleted=False)
            if cls_obj:
                eval_sub_qs = eval_sub_qs.filter(
                    Q(classrooms=cls_obj) | Q(levels=cls_obj.level_id)
                ).distinct()

            # Si le filtre spécifique classe ne retourne rien, fallback aux épreuves de la session
            if not eval_sub_qs.exists():
                eval_sub_qs = EvaluationSubject.objects.filter(session_id=active_eval_id, is_deleted=False)

            subject_ids = list(eval_sub_qs.values_list("subject_id", flat=True).distinct())
            subject_qs = Subject.objects.filter(id__in=subject_ids, is_deleted=False)

            subjects_data = [
                {"id": str(s.pk), "name": s.name}
                for s in subject_qs.order_by("name")
            ]

            active_sub_id = subject_id if any(s["id"] == subject_id for s in subjects_data) else (subjects_data[0]["id"] if subjects_data else None)

            if active_sub_id:
                eval_subject = eval_sub_qs.filter(subject_id=active_sub_id).first()
                if not eval_subject:
                    eval_subject = EvaluationSubject.objects.filter(
                        session_id=active_eval_id,
                        subject_id=active_sub_id,
                        is_deleted=False
                    ).first()

                if not eval_subject and est_id:
                    eval_subject = EvaluationSubject.objects.create(
                        session_id=active_eval_id,
                        subject_id=active_sub_id,
                        establishment_id=est_id,
                        max_score=Decimal("20.0"),
                    )
        else:
            active_sub_id = None

        # 4. ÉLÈVES : UNIQUEMENT LES ÉLÈVES AU STATUT 'REGISTERED' (INSCRIT)
        students_data = []
        if active_class_id:
            enrollments = Enrollment.objects.filter(
                classroom_id=active_class_id,
                status="REGISTERED",  # Règle Métier : Élèves Inscrits Uniquement !
                is_deleted=False
            ).select_related("student")

            if est_id:
                enrollments = enrollments.filter(establishment_id=est_id)

            existing_grades = {}
            if eval_subject:
                for g in Grade.objects.filter(evaluation_subject=eval_subject, is_deleted=False):
                    existing_grades[str(g.student_id)] = g

            for en in enrollments:
                st = en.student
                g_obj = existing_grades.get(str(st.pk))
                g_val = float(g_obj.value) if g_obj and g_obj.value is not None else None
                
                students_data.append({
                    "id": str(st.pk),
                    "matricule": st.matricule,
                    "lastName": st.last_name,
                    "firstName": st.first_name,
                    "grade": g_val,
                    "comment": g_obj.comment if g_obj else "",
                    "absenceStatus": g_obj.absence_status if g_obj else "NONE",
                })

        return Response({
            "evaluations": evaluations_data,
            "classrooms": classrooms_data,
            "subjects": subjects_data,
            "selectedEvalId": active_eval_id,
            "selectedClassId": active_class_id,
            "selectedSubjectId": active_sub_id,
            "evaluationSubjectId": str(eval_subject.pk) if eval_subject else None,
            "students": students_data,
        }, status=200)

    def post(self, request):
        est_id = get_request_establishment_id(request)
        service = GradeService(user=getattr(request, "user", None), establishment_id=est_id)
        try:
            result = service.save_portal_grades(request.data)
            return Response(result, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
