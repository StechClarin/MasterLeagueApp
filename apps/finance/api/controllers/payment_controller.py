from rest_framework import status
from apps.core.api.controllers.BaseController import BaseController
from apps.finance.models import Payment
from apps.finance.api.serializers.finance_serializer import PaymentSerializer, PaymentReadSerializer
from apps.finance.services.payment_service import PaymentService
from apps.finance.services.finance_service import FinanceService

class PaymentController(BaseController):
    serializer_class = PaymentSerializer
    service_class = PaymentService

    def get_serializer_class(self, action='read'):
        if action == 'read':
            return PaymentReadSerializer
        return PaymentSerializer

    def financial_status(self, request, pk):
        """
        Action personnalisée pour récupérer la situation financière globale d'un élève.
        pk est ici student_id.
        """
        status_data = self.service.get_student_financial_status(pk)
        return self.success_response(status_data, "Situation financière récupérée.", status.HTTP_200_OK)

    def collection_report(self, request):
        """
        Génère l'état de recouvrement périodique.
        """
        classroom_id = request.query_params.get('classroom_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not classroom_id:
            return self.error_response("L'identifiant de la classe est requis.", status.HTTP_400_BAD_REQUEST)
            
        finance_service = FinanceService()
        finance_service.set_context(request.user, request.establishment_id)
        
        report_data = finance_service.get_collection_report(classroom_id, start_date, end_date)
        return self.success_response(report_data, "État de recouvrement généré.", status.HTTP_200_OK)
