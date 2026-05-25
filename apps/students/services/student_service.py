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
        
        data = super().before_validate(data, instance)
        if not data.get('matricule') and not instance:
            data['matricule'] = self._generate_matricule(data.get('establishment') or data.get('establishment_id'))
        return data

    def _generate_matricule(self, establishment_id=None):
        from datetime import date
        year_suffix = date.today().strftime('%y')
        
        est_code = "ET"
        establishment = None
        if establishment_id:
            from apps.core.models.establishment import Establishment
            establishment = Establishment.objects.filter(id=establishment_id).first()
            if establishment and establishment.name:
                est_code = establishment.name[:2].upper()
            
        pattern = f"{year_suffix}-{est_code}-"
        
        last_student = self.model.all_objects.filter(
            matricule__startswith=pattern,
            establishment=establishment
        ).order_by('-matricule').first()
        
        seq = 1
        if last_student and last_student.matricule:
            try:
                parts = last_student.matricule.split('-')
                if len(parts) >= 3:
                     seq = int(parts[2]) + 1
            except ValueError:
                pass
        
        return f"{year_suffix}-{est_code}-{seq:04d}"

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
        """
        Gère les relations après la sauvegarde de l'étudiant.
        Les données relationnelles ont été validées au préalable par le Serializer.
        """
        related_data = getattr(self, '_temp_related_data', {})
        health_data = related_data.get('health_data')
        parents_data = related_data.get('parents_data', [])
        enrollment_data = related_data.get('enrollment_data')
        student = instance

        # 1. Santé
        if health_data:
            StudentHealth.objects.update_or_create(
                student=student,
                defaults={
                    'establishment': student.establishment,
                    **health_data
                }
            )

        # 2. Inscription
        if enrollment_data:
            # Récupération sécurisée des instances ou IDs
            classroom_id = enrollment_data.get('classroom_id')
            academic_year_id = enrollment_data.get('academic_year_id')
            
            # DRF PrimaryKeyRelatedField renvoie l'objet, on extrait l'ID si c'est le cas
            if hasattr(classroom_id, 'id'): classroom_id = classroom_id.id
            if hasattr(academic_year_id, 'id'): academic_year_id = academic_year_id.id

            Enrollment.objects.update_or_create(
                student=student,
                academic_year_id=academic_year_id,
                defaults={
                    'establishment_id': student.establishment_id,
                    'classroom_id': classroom_id,
                    'is_repeater': enrollment_data.get('is_repeater', False),
                    'status': enrollment_data.get('status', 'PENDING')
                }
            )

        # 3. Parents / Tuteurs
        if parents_data:
            current_guardians = list(student.guardians.all()) if not created else []
            
            for p_data in parents_data:
                phone = p_data.get('phone_number')
                if not phone: continue
                
                guardian, _ = Guardian.objects.get_or_create(
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
        
        # 4. Synchronisation Photo de profil
        if instance.photo:
            try:
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
            except (ImportError, Exception):
                pass 

        # Nettoyage de la mémoire temporaire
        self._temp_related_data = {}


