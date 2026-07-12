import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.students.services.student_service import StudentService
from apps.structure.models import ClassRoom

service = StudentService()
service.establishment_id = "2bebda75-8a78-44b8-9e2e-ebcd3bb2e118"  # The establishment of the classroom

data = {
    "first_name": "test_first",
    "last_name": "test_last",
    "gender": "M",
    "date_of_birth": "2020-01-01",
    "place_of_birth": "test_place",
    "address": "test_address",
    "health_input": {"blood_group":"","allergies":"","medical_conditions":"","emergency_contact_name":"","emergency_contact_phone":""},
    "enrollment_input": {"classroom_id":"cb8b797a-2c54-4c14-8c14-e717f1cd87d9","academic_year_id":"3936dc59-7928-4fcb-a4a1-2da1ef9b8fe7","is_repeater":True},
    "parents_input": []
}

try:
    student = service.save(data)
    print("Success. Student ID:", student.id, "Est_id:", student.establishment_id)
except Exception as e:
    import traceback
    traceback.print_exc()

