import graphene
from apps.documents.models.document import Document
from apps.documents.graphql.Types.document_type import DocumentType
from django.contrib.contenttypes.models import ContentType

class DocumentQuery(graphene.ObjectType):
    documents_by_entity = graphene.List(
        DocumentType,
        app_label=graphene.String(required=True),
        model_name=graphene.String(required=True),
        object_id=graphene.ID(required=True)
    )

    def resolve_documents_by_entity(self, info, app_label, model_name, object_id):
        try:
            ct = ContentType.objects.get(app_label=app_label, model=model_name)
            return Document.objects.filter(content_type=ct, object_id=object_id)
        except ContentType.DoesNotExist:
            return []
