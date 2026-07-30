import strawberry
import strawberry_django
from apps.documents.models.document import Document

@strawberry_django.type(Document)
class DocumentType:
    id: strawberry.ID
    title: strawberry.auto
    document_type: strawberry.auto
    object_id: strawberry.auto
    uploaded_at: strawberry.auto
    
    @strawberry.field
    def file_url(self) -> str | None:
        if self.file:
            return self.file.url
        return None
