from rest_framework import serializers
from django.db import transaction
from apps.core.api.serializers import BaseSerializer
from ...models import Student, StudentHealth, Guardian, Enrollment
from ...services.guardian_service import GuardianService

from .student_health_serializer import StudentHealthSerializer

class ParentInputSerializer(serializers.Serializer):
    """
    Serializer pour l'entrée 'parents' (n'est pas un ModelSerializer standard)
    """
    role = serializers.ChoiceField(choices=['FATHER', 'MOTHER', 'TUTOR'])
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    phone_number = serializers.CharField(required=True)
    profession = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    is_legal_guardian = serializers.BooleanField(default=False)

class EnrollmentInputSerializer(serializers.Serializer):
    classroom_id = serializers.IntegerField(required=True)
    academic_year_id = serializers.IntegerField(required=True) # Ou déduit du context
    is_repeater = serializers.BooleanField(default=False)

class StudentSerializer(BaseSerializer):
    # Nested Outputs (Read)
    health = StudentHealthSerializer(read_only=True)
    current_enrollment = serializers.SerializerMethodField()
    
    # Nested Inputs (Write)
    health_input = StudentHealthSerializer(write_only=True, required=False)
    parents_input = ParentInputSerializer(many=True, write_only=True, required=False)
    enrollment_input = EnrollmentInputSerializer(write_only=True, required=False)

    class Meta:
        model = Student
        fields = '__all__'
        read_only_fields = ['matricule']

    def get_current_enrollment(self, obj):
        # Optimization: prefetch_related in ViewSet avoiding N+1
        # Logic: return latest enrollment
        enrollment = obj.enrollments.order_by('-created_at').first()
        if enrollment:
            return {
                "id": enrollment.id,
                "classroom": enrollment.classroom.name,
                "status": enrollment.status
            }
        return None

    @transaction.atomic
    def create(self, validated_data):
        # Extract nested data
        health_data = validated_data.pop('health_input', None)
        parents_data = validated_data.pop('parents_input', [])
        enrollment_data = validated_data.pop('enrollment_input', None)

        # 1. Create Student
        student = super().create(validated_data) # Handles establishment from context

        # 2. Create Health Record
        if health_data:
            StudentHealth.objects.create(
                student=student,
                establishment=student.establishment,
                **health_data
            )

        # 3. Create Enrollment
        if enrollment_data:
            Enrollment.objects.create(
                student=student,
                establishment=student.establishment, # Validated by model check
                classroom_id=enrollment_data['classroom_id'],
                academic_year_id=enrollment_data['academic_year_id'],
                is_repeater=enrollment_data['is_repeater']
            )

        # 4. Handle Guardians
        guardian_service = GuardianService() # Or use a static method logic
        for p_data in parents_data:
            # Check if guardian exists by phone number (Business Key)
            phone = p_data['phone_number']
            guardian, created = Guardian.objects.get_or_create(
                phone_number=phone,
                defaults={
                    'establishment': student.establishment, # Primary establishment
                    'profession': p_data.get('profession', ''),
                }
            )
            # Create User stub if needed (Todo)
            
            # Link to student
            guardian.students.add(student)
            
            # Update info if exists? For now, keep existing to avoid overwrite by secondary child entry
            if not created: 
                 # Optional: Update profession via service if provided
                 pass

        return student
