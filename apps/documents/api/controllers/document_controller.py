from apps.core.api.controllers.BaseController import BaseController
from ..serializers.document_serializer import DocumentSerializer
from ...services.document_service import DocumentService

class DocumentController(BaseController):
    serializer_class = DocumentSerializer
    service_class = DocumentService
