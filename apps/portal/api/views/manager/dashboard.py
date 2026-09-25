from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import JSONParser
from django.db.models import Sum, Q

from apps.students.models import Student, Enrollment
from apps.structure.models import ClassRoom
from apps.hr.models import Personnel
from apps.evaluations.models import EvaluationSession
from apps.finance.models import Payment, Invoice
from apps.portal.api.views.utils import get_request_establishment_id


class ManagerDashboardView(APIView):
    """
    GET /api/portal/manager/dashboard/
    Tableau de bord dynamique pour le Portail Manager & SuperAdmin.
    Fournit l'ensemble des données académiques et financières (accessibles selon le profil).
    """
    authentication_classes = []
    permission_classes = [AllowAny]
    parser_classes = [JSONParser]

    def get(self, request):
        est_id = get_request_establishment_id(request)

        student_qs = Student.objects.filter(is_active=True)
        enrollment_qs = Enrollment.objects.filter(is_deleted=False)
        classroom_qs = ClassRoom.objects.filter(is_deleted=False)
        personnel_qs = Personnel.objects.filter(is_active=True)
        evaluation_qs = EvaluationSession.objects.filter(is_deleted=False)
        payment_qs = Payment.objects.filter(is_deleted=False)
        invoice_qs = Invoice.objects.filter(is_deleted=False)

        if est_id:
            student_qs = student_qs.filter(establishment_id=est_id)
            enrollment_qs = enrollment_qs.filter(establishment_id=est_id)
            classroom_qs = classroom_qs.filter(establishment_id=est_id)
            personnel_qs = personnel_qs.filter(establishment_id=est_id)
            evaluation_qs = evaluation_qs.filter(establishment_id=est_id)
            payment_qs = payment_qs.filter(establishment_id=est_id)
            invoice_qs = invoice_qs.filter(establishment_id=est_id)

        total_students = student_qs.count()
        registered_students = enrollment_qs.filter(status="REGISTERED").count()
        pending_students = enrollment_qs.filter(status="PENDING").count()
        total_classrooms = classroom_qs.count()
        total_staff = personnel_qs.count()
        teacher_count = personnel_qs.filter(Q(job_title__icontains="enseignant") | Q(job_title__icontains="prof") | Q(pedagogy_assignments__isnull=False)).distinct().count()
        total_evaluations = evaluation_qs.count()

        total_enrolled_all = enrollment_qs.count()
        validation_rate = round((float(registered_students) / float(total_enrolled_all) * 100), 1) if total_enrolled_all > 0 else 100.0

        # Métriques Financières pour Super Admin
        total_collected = payment_qs.aggregate(total=Sum("amount"))["total"] or 0
        total_invoiced = invoice_qs.aggregate(total=Sum("total_amount"))["total"] or 0
        total_remaining = total_invoiced - total_collected
        if total_remaining < 0:
            total_remaining = 0
        collection_rate = round((float(total_collected) / float(total_invoiced) * 100), 1) if total_invoiced > 0 else 0.0

        recent_enrolments = []
        for en in enrollment_qs.select_related("student", "classroom").order_by("-created_at")[:6]:
            recent_enrolments.append({
                "id": str(en.pk),
                "studentName": f"{en.student.first_name} {en.student.last_name}",
                "className": en.classroom.name if en.classroom else "Non assigné",
                "date": en.created_at.strftime("%Y-%m-%d"),
                "status": en.status,
            })

        return Response({
            "metrics": {
                "totalStudents": total_students,
                "registeredStudents": registered_students,
                "pendingStudents": pending_students,
                "totalClassrooms": total_classrooms,
                "totalStaff": total_staff,
                "teacherCount": teacher_count,
                "totalEvaluations": total_evaluations,
                "validationRate": validation_rate,
                "totalInvoiced": float(total_invoiced),
                "totalCollected": float(total_collected),
                "totalRemaining": float(total_remaining),
                "collectionRate": collection_rate,
            },
            "recentEnrolments": recent_enrolments,
        }, status=200)
