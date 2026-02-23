from django.core.exceptions import ValidationError
from apps.core.services.BaseService import BaseService
from ..models import Student, StudentHealth, Guardian, Enrollment

class StudentService(BaseService):
    model = Student

    def before_validate(self, data, instance=None):
        import json
        # Handle JSON strings from FormData (Angular Refactor)
        json_fields = ['health_input', 'parents_input', 'enrollment_input']
        
        # Determine if data supports item assignment (dict or mutable)
        if hasattr(data, 'dict'):
             data = data.dict()
        elif hasattr(data, 'copy'):
             data = data.copy()

        for field in json_fields:
            if field in data and isinstance(data[field], str):
                try:
                    data[field] = json.loads(data[field])
                except json.JSONDecodeError:
                    pass
        
        return super().before_validate(data, instance)

    def save_process(self, data, instance=None):
        # Extract nested data for after_save
        # Use pop to avoid issues with Student model having no such fields
        self._temp_related_data = {
            'health_data': data.pop('health_input', None),
            'parents_data': data.pop('parents_input', []),
            'enrollment_data': data.pop('enrollment_input', None)
        }

        if instance:
            # UPDATE
            for attr, value in data.items():
                setattr(instance, attr, value)
            instance.save()
            student = instance
            created = False
        else:
            # CREATE
            try:
                student = self.model.objects.create(**data)
                created = True
            except Exception as e:
                # If database constraints fail (e.g. matricule unique), re-raise as ValidationError
                raise ValidationError({"detail": str(e)})
        
        return student, created

    def after_save(self, instance, created):
        related_data = getattr(self, '_temp_related_data', {})
        health_data = related_data.get('health_data')
        parents_data = related_data.get('parents_data', [])
        enrollment_data = related_data.get('enrollment_data')
        student = instance

        # 1. Handle Health Record
        if health_data:
            StudentHealth.objects.update_or_create(
                student=student,
                defaults={
                    'establishment': student.establishment,
                    **health_data
                }
            )

        # 2. Handle Enrollment
        if enrollment_data:
            year_id = enrollment_data.get('academic_year_id')
            classroom_id = enrollment_data.get('classroom_id')
            
            if not year_id or not classroom_id:
                raise ValidationError({
                    "enrollment_input": {
                        "academic_year_id": ["Ce champ est requis."] if not year_id else [],
                        "classroom_id": ["Ce champ est requis."] if not classroom_id else [],
                    }
                })

            # Check if enrollment already exists for this year
            Enrollment.objects.update_or_create(
                student=student,
                academic_year_id=year_id,
                defaults={
                    'establishment': student.establishment,
                    'classroom_id': classroom_id,
                    'is_repeater': enrollment_data.get('is_repeater', False),
                    'status': 'REGISTERED'
                }
            )

        # 3. Handle Guardians
        if parents_data:
            current_guardians = list(student.guardians.all()) if not created else []
            
            for p_data in parents_data:
                phone = p_data.get('phone_number')
                if not phone: continue
                
                guardian, created_g = Guardian.objects.get_or_create(
                    phone_number=phone,
                    defaults={
                        'establishment': student.establishment,
                        'first_name': p_data.get('first_name', ''),
                        'last_name': p_data.get('last_name', ''),
                        'profession': p_data.get('profession', ''),
                    }
                )
                
                if guardian not in current_guardians:
                    student.guardians.add(guardian)
        
        # 4. Profile Photo (Sync with Documents app pattern if used)
        if instance.photo:
            try:
                from django.contrib.contenttypes.models import ContentType
                from apps.documents.models.document import Document
                
                ct = ContentType.objects.get_for_model(instance)
                Document.objects.update_or_create(
                    content_type=ct,
                    object_id=instance.id,
                    document_type='PHOTO',
                    defaults={
                        'title': f"Photo de profil - {instance.first_name} {instance.last_name}",
                        'file': instance.photo
                    }
                )
            except ImportError:
                pass # Documents app might not be installed or configured

        # Cleanup
        self._temp_related_data = {}

    def after_save(self, instance, created):
        # Retrieve data from temp storage
        related_data = getattr(self, '_temp_related_data', {})
        health_data = related_data.get('health_data')
        parents_data = related_data.get('parents_data', [])
        enrollment_data = related_data.get('enrollment_data')
        student = instance

        # 1. Handle Health Record
        if health_data:
            StudentHealth.objects.update_or_create(
                student=student,
                defaults={
                    'establishment': student.establishment,
                    **health_data
                }
            )

        # 2. Handle Enrollment
        if enrollment_data:
            year_id = enrollment_data.get('academic_year_id')
            if year_id:
                Enrollment.objects.update_or_create(
                    student=student,
                    academic_year_id=year_id,
                    defaults={
                        'establishment': student.establishment,
                        'classroom_id': enrollment_data['classroom_id'],
                        'is_repeater': enrollment_data.get('is_repeater', False),
                        'status': 'REGISTERED'
                    }
                )

        # 3. Handle Guardians
        if parents_data:
            current_guardians = list(student.guardians.all()) if not created else []
            
            for p_data in parents_data:
                phone = p_data.get('phone_number')
                if not phone: continue
                
                guardian, created_g = Guardian.objects.get_or_create(
                    phone_number=phone,
                    defaults={
                        'establishment': student.establishment,
                        'first_name': p_data.get('first_name', ''),
                        'last_name': p_data.get('last_name', ''),
                        'profession': p_data.get('profession', ''),
                    }
                )
                
                if guardian not in current_guardians:
                    student.guardians.add(guardian)
        
        # 4. Sync Photo to Document
        if instance.photo:
            from django.contrib.contenttypes.models import ContentType
            from apps.documents.models.document import Document
            
            ct = ContentType.objects.get_for_model(instance)
            
            doc = Document.objects.filter(
                content_type=ct, 
                object_id=instance.id, 
                document_type='PHOTO'
            ).first()

            if not doc:
                doc = Document(
                    content_type=ct,
                    object_id=instance.id,
                    document_type='PHOTO',
                    title=f"Photo de profil - {instance.first_name} {instance.last_name}"
                )
                doc.file.name = instance.photo.name
                doc.save()
            else:
                if doc.file.name != instance.photo.name:
                    doc.file.name = instance.photo.name
                    doc.title = f"Photo de profil - {instance.first_name} {instance.last_name}"
                    doc.save()

        # Cleanup
        self._temp_related_data = {}
