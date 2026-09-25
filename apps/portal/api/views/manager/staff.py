from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import JSONParser

from apps.hr.models import Personnel
from apps.portal.api.views.utils import get_request_establishment_id


class ManagerStaffView(APIView):
    """
    GET /api/portal/manager/staff/
    Annuaire mobile des enseignants et personnels.
    """
    authentication_classes = []
    permission_classes = [AllowAny]
    parser_classes = [JSONParser]

    def get(self, request):
        est_id = get_request_establishment_id(request)
        qs = Personnel.objects.filter(is_active=True).select_related("user")

        if est_id:
            qs = qs.filter(establishment_id=est_id)

        staff_list = []
        for p in qs.order_by("last_name")[:40]:
            staff_list.append({
                "id": str(p.pk),
                "name": f"{p.first_name} {p.last_name}",
                "jobTitle": p.job_title or "Personnel",
                "phone": p.phone_number or (p.user.phone if p.user and hasattr(p.user, 'phone') else ""),
                "email": p.email_pro or (p.user.email if p.user else ""),
                "isTeacher": p.is_teacher,
            })

        return Response({"staff": staff_list}, status=200)
