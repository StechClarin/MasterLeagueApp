import re
from datetime import date
from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from apps.core.api.serializers import BaseSerializer
from ...models import Student, StudentHealth, Guardian, Enrollment
from ...services.guardian_service import GuardianService

from .student_health_serializer import StudentHealthSerializer

class ParentInputSerializer(serializers.Serializer):
    """
    Serializer pour l'entrée 'parents' avec validation stricte.
    """
    role = serializers.ChoiceField(
        choices=['FATHER', 'MOTHER', 'TUTOR'],
        error_messages={'invalid_choice': "Le rôle doit être Père, Mère ou Tuteur."}
    )
    first_name = serializers.CharField(
        required=True, 
        error_messages={'required': "Le prénom du parent est obligatoire."}
    )
    last_name = serializers.CharField(
        required=True,
        error_messages={'required': "Le nom du parent est obligatoire."}
    )
    phone_number = serializers.CharField(
        required=True,
        error_messages={'required': "Un numéro de téléphone est requis pour chaque parent."}
    )
    profession = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    email = serializers.EmailField(
        required=False, 
        allow_blank=True,
        allow_null=True,
        error_messages={'invalid': "Format d'email invalide."}
    )
    is_legal_guardian = serializers.BooleanField(default=False)

    def validate_phone_number(self, value):
        # Format simple: min 4 chiffres
        clean_phone = re.sub(r'\s+', '', value)
        if not re.match(r'^\+?[\d\-]{4,}$', clean_phone):
            raise serializers.ValidationError("Le numéro de téléphone n'est pas valide.")
        return value

class EnrollmentInputSerializer(serializers.Serializer):
    classroom_id = serializers.PrimaryKeyRelatedField(
        queryset=Enrollment._meta.get_field('classroom').related_model.objects.all(),
        required=True,
        error_messages={'does_not_exist': "La classe sélectionnée n'existe pas."}
    )
    academic_year_id = serializers.PrimaryKeyRelatedField(
        queryset=Enrollment._meta.get_field('academic_year').related_model.objects.all(),
        required=True,
        error_messages={'does_not_exist': "L'année académique sélectionnée n'existe pas."}
    )
    is_repeater = serializers.BooleanField(required=False, default=False)

    def validate(self, data):
        academic_year = data.get('academic_year_id')
        if academic_year and academic_year.is_archived:
            raise serializers.ValidationError({
                "academic_year_id": "Impossible d'inscrire un élève dans une année académique archivée."
            })
        return data

class StudentSerializer(BaseSerializer):
    # Nested Outputs (Read)
    health = StudentHealthSerializer(read_only=True)
    current_enrollment = serializers.SerializerMethodField()
    guardians = serializers.SerializerMethodField()
    
    # Nested Inputs (Write)
    health_input = StudentHealthSerializer(write_only=True, required=False)
    parents_input = ParentInputSerializer(many=True, write_only=True, required=False)
    enrollment_input = EnrollmentInputSerializer(write_only=True, required=False)

    class Meta:
        model = Student
        fields = '__all__'
        read_only_fields = []
        error_messages = {
            'first_name': {'required': "Le prénom de l'élève est obligatoire."},
            'last_name': {'required': "Le nom de l'élève est obligatoire."},
        }

    def validate_date_of_birth(self, value):
        if value and value > date.today():
            raise serializers.ValidationError("La date de naissance ne peut pas être dans le futur.")
        return value

    def validate_parents_input(self, value):
        if not value or len(value) == 0:
            raise serializers.ValidationError("Au moins un parent ou tuteur doit être renseigné.")
        return value

    def validate(self, data):
        # 1. Validation de l'inscription
        enrollment_data = data.get('enrollment_input')
        if enrollment_data:
            classroom = enrollment_data.get('classroom_id')
            academic_year = enrollment_data.get('academic_year_id')
            
            # Check for existing enrollment (only on creation)
            if not self.instance and academic_year:
                # On ne peut pas facilement vérifier ici si l'élève existe déjà car il n'est pas encore créé 
                # (sauf si on se base sur d'autres critères comme photo/nom/prenom/naissance)
                pass

        return data

    def get_current_enrollment(self, obj):
        # Optimization: prefetch_related in ViewSet avoiding N+1
        # Logic: return latest enrollment
        enrollment = obj.enrollments.order_by('-created_at').first()
        if enrollment:
            return {
                "id": enrollment.id,
                "classroom": enrollment.classroom.name,
                "classroom_id": enrollment.classroom.id,
                "academic_year_id": enrollment.academic_year.id,
                "status": enrollment.status
            }
        return None

    def get_guardians(self, obj):
        return [
            {
                "id": g.id,
                "role": g.role,
                "first_name": g.first_name,
                "last_name": g.last_name,
                "phone_number": g.phone_number,
                "profession": g.profession,
                "is_legal_guardian": g.is_legal_guardian,
            }
            for g in obj.guardians.all()
        ]
