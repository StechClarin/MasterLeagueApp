import graphene
from graphene_django import DjangoObjectType
from apps.documents.models.document import Document

class DocumentType(DjangoObjectType):
    class Meta:
        model = Document
        fields = "__all__"
    
    file_url = graphene.String()

    def resolve_file_url(self, info):
        if self.file:
            # Assure returning an absolute or relative URL usable by frontend
            return self.file.url
        return None
