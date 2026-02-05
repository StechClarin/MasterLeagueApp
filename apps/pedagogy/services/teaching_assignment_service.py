from apps.core.services.BaseService import BaseService
from ..models import TeachingAssignment

class TeachingAssignmentService(BaseService):
    model = TeachingAssignment

    def before_validate(self, data, instance=None):
        # Mapping automatique des clés _id vers les clés du modèle
        # car le frontend envoie xxx_id mais le serializer attend xxx ou xxx_id (selon DRF)
        # Mais DRF avec PrimaryKeyRelatedField peut être strict.
        
        mapping = {
            'personnel_id': 'personnel',
            'classroom_id': 'classroom',
            'subject_id': 'subject',
            'academic_year_id': 'academic_year'
        }

        for input_key, model_key in mapping.items():
            if input_key in data:
                data[model_key] = data.pop(input_key)
        
        return super().before_validate(data, instance)

    def before_save(self, data, instance=None):
        # Validation Métier
        from rest_framework.exceptions import ValidationError
        
        personnel = data.get('personnel')
        classroom = data.get('classroom')
        subject = data.get('subject')
        academic_year = data.get('academic_year')
        
        # 1. Unicité : Un enseignant ne peut pas avoir la même affectation 2 fois
        qs = self.model.objects.filter(
            personnel=personnel,
            classroom=classroom,
            subject=subject,
            academic_year=academic_year
        )
        if instance:
            qs = qs.exclude(pk=instance.pk)
            
        if qs.exists():
            raise ValidationError("Cet enseignant est déjà affecté à cette matière dans cette classe pour cette année.")

        # 2. Validation Dates
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date and start_date > end_date:
             raise ValidationError("La date de début ne peut pas être après la date de fin.")
             
        return data
