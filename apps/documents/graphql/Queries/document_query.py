import strawberry
from apps.documents.models.document import Document
from apps.documents.graphql.Types.document_type import DocumentType
from django.contrib.contenttypes.models import ContentType

@strawberry.type
class DocumentQuery:
    @strawberry.field
    def documents_by_entity(
        self,
        app_label: str,
        model_name: str,
        object_id: strawberry.ID
    ) -> list[DocumentType]:
        try:
            ct = ContentType.objects.get(app_label=app_label, model=model_name)
            return list(Document.objects.filter(content_type=ct, object_id=object_id))
        except ContentType.DoesNotExist:
            return []
