from apps.core.services.BaseService import BaseService
from ..models import Student, StudentHealth, Guardian, Enrollment

class StudentService(BaseService):
    model = Student

    def save_process(self, data, instance=None):
        # Extract nested data to temporary storage for after_save
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
            student = self.model.objects.create(**data)
            created = True
        
        return student, created

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
        
        # Cleanup
        self._temp_related_data = {}
