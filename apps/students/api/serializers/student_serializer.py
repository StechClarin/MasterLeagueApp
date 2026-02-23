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
    academic_year_id = serializers.IntegerField(required=True)
    is_repeater = serializers.BooleanField(required=False, default=False)

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
