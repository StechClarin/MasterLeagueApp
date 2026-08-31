from apps.core.api.controllers.BaseController import BaseController
from ..serializers.finance_serializer import ExpenseSerializer
from ...services.expense_service import ExpenseService

class ExpenseController(BaseController):
    serializer_class = ExpenseSerializer
    service_class = ExpenseService