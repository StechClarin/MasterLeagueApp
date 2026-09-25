from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import JSONParser
from django.db.models import Q

from apps.students.models import Student, Enrollment
from apps.structure.models import ClassRoom
from apps.students.services.student_service import StudentService
from apps.portal.api.views.utils import get_request_establishment_id


class ManagerStudentsView(APIView):
    """
    GET /api/portal/manager/students/?search=...&status=...&classroom_id=...&establishment_id=...
    Recherche et gestion dynamique des dossiers d'inscription des élèves.

    POST /api/portal/manager/students/
    Créer un élève via StudentService (enfant de BaseService) et enregistrer son inscription.
    """
    authentication_classes = []
    permission_classes = [AllowAny]
    parser_classes = [JSONParser]

    def get(self, request):
        search_query = request.query_params.get("search", "").strip()
        status_filter = request.query_params.get("status", "").strip()
        classroom_id = request.query_params.get("classroom_id", "").strip()
        est_id = get_request_establishment_id(request)

        enrollments = Enrollment.objects.select_related("student", "classroom", "academic_year").all()

        if est_id:
            enrollments = enrollments.filter(establishment_id=est_id)

        if classroom_id:
            enrollments = enrollments.filter(classroom_id=classroom_id)

        if status_filter:
            enrollments = enrollments.filter(status=status_filter)

        if search_query:
            enrollments = enrollments.filter(
                Q(student__first_name__icontains=search_query) |
                Q(student__last_name__icontains=search_query) |
                Q(student__matricule__icontains=search_query)
            )

        total_students = enrollments.count()
        registered_count = enrollments.filter(status="REGISTERED").count()
        pending_count = enrollments.filter(status="PENDING").count()

        # Pagination
        try:
            page = max(1, int(request.query_params.get("page", 1)))
        except (ValueError, TypeError):
            page = 1

        try:
            page_size = max(1, min(100, int(request.query_params.get("page_size", 15))))
        except (ValueError, TypeError):
            page_size = 15

        total_pages = max(1, (total_students + page_size - 1) // page_size) if total_students > 0 else 1
        offset = (page - 1) * page_size

        students_data = []
        for en in enrollments[offset : offset + page_size]:
            st = en.student
            students_data.append({
                "id": str(st.pk),
                "enrollmentId": str(en.pk),
                "matricule": st.matricule,
                "lastName": st.last_name,
                "firstName": st.first_name,
                "gender": st.gender,
                "dateOfBirth": st.date_of_birth.strftime("%Y-%m-%d") if st.date_of_birth else None,
                "classroom": en.classroom.name if en.classroom else "Non assignée",
                "classroomId": str(en.classroom.id) if en.classroom else None,
                "status": en.status,
                "registrationDate": en.created_at.strftime("%Y-%m-%d"),
            })

        classrooms_qs = ClassRoom.objects.filter(is_deleted=False)
        if est_id:
            classrooms_qs = classrooms_qs.filter(establishment_id=est_id)

        classrooms_data = [
            {"id": str(c.pk), "name": c.name}
            for c in classrooms_qs
        ]

        return Response({
            "metrics": {
                "totalStudents": total_students,
                "registeredCount": registered_count,
                "pendingCount": pending_count,
            },
            "pagination": {
                "page": page,
                "pageSize": page_size,
                "totalCount": total_students,
                "totalPages": total_pages,
            },
            "students": students_data,
            "classrooms": classrooms_data,
        }, status=200)

    def post(self, request):
        est_id = get_request_establishment_id(request)
        data = request.data.copy() if hasattr(request.data, "copy") else dict(request.data)

        first_name = data.get("firstName") or data.get("first_name")
        last_name = data.get("lastName") or data.get("last_name")
        classroom_id = data.get("classroomId") or data.get("classroom_id")

        if not first_name or not last_name:
            return Response({"error": "Le nom et le prénom sont obligatoires."}, status=400)

        gender = data.get("gender", "M")
        date_of_birth = data.get("date_of_birth") or data.get("dateOfBirth")
        place_of_birth = data.get("place_of_birth") or data.get("placeOfBirth")
        address = data.get("address")
        is_repeater = data.get("is_repeater", False)

        tutor_first_name = data.get("tutor_first_name") or data.get("tutorFirstName")
        tutor_last_name = data.get("tutor_last_name") or data.get("tutorLastName")
        tutor_phone_number = data.get("tutor_phone_number") or data.get("tutorPhoneNumber")

        # Utilisation de StudentService (enfant de BaseService)
        service = StudentService(establishment_id=est_id)
        student_data = {
            "first_name": first_name,
            "last_name": last_name,
            "gender": gender,
            "date_of_birth": date_of_birth if date_of_birth else None,
            "place_of_birth": place_of_birth or "",
            "address": address or "",
        }

        if classroom_id:
            student_data["enrollment_input"] = {
                "classroom_id": classroom_id,
                "is_repeater": is_repeater,
            }
        else:
            student_data["is_repeater"] = is_repeater

        if tutor_first_name or tutor_last_name or tutor_phone_number:
            student_data["tutor_first_name"] = tutor_first_name or ""
            student_data["tutor_last_name"] = tutor_last_name or ""
            student_data["tutor_phone_number"] = tutor_phone_number or ""

        if est_id:
            student_data["establishment_id"] = est_id

        try:
            student = service.save(student_data)
            return Response({
                "success": True,
                "student": {
                    "id": str(student.pk),
                    "matricule": student.matricule,
                    "firstName": student.first_name,
                    "lastName": student.last_name,
                }
            }, status=201)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
