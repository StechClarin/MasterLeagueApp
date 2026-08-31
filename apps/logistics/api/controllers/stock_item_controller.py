from apps.core.api.controllers.BaseController import BaseController
from ..serializers.stock_item_serializer import StockItemSerializer
from ...services.stock_item_service import StockItemService

class StockItemController(BaseController):
    serializer_class = StockItemSerializer
    service_class = StockItemService
