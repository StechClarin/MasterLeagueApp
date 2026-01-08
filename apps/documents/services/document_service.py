from apps.core.services.BaseService import BaseService
from apps.documents.models.document import Document

from django.contrib.contenttypes.models import ContentType
from rest_framework.exceptions import ValidationError

class DocumentService(BaseService):
    model = Document

    def before_validate(self, data, instance=None):
        data = super().before_validate(data, instance)
        
        # Manually resolve ContentType if 'content_type' is missing but app/model are provided
        if 'content_type' not in data:
            app_label = data.get('content_type_app')
            model_name = data.get('content_type_model')
            
            if app_label and model_name:
                try:
                    ct = ContentType.objects.get(app_label=app_label, model=model_name)
                    data['content_type'] = ct.id
                except ContentType.DoesNotExist:
                    raise ValidationError(f"ContentType introuvable pour {app_label}.{model_name}")
        
        return data
