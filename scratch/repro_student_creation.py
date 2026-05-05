import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.students.models import Student
from apps.structure.models import ClassRoom, AcademicYear
from apps.profilmanagement.models import User

# On prend un user et des infos de base
user = User.objects.filter(is_superuser=True).first()
establishment = user.memberships.first().establishment if user else None
classroom = ClassRoom.objects.filter(establishment=establishment).first()
year = AcademicYear.objects.filter(establishment=establishment).first()

if not all([user, establishment, classroom, year]):
    print("Missing prerequisites in DB")
    exit(1)

from apps.students.services.student_service import StudentService
service = StudentService()
service.set_context(user, establishment.id)

data = {
    'first_name': 'Test',
    'last_name': 'Student',
    'gender': 'M',
    'date_of_birth': '2000-01-01',
    'parents_input': [
        {
            'role': 'FATHER',
            'first_name': 'Parent',
            'last_name': 'One',
            'phone_number': '123456789'
        }
    ],
    'enrollment_input': {
        'classroom_id': classroom.id,
        'academic_year_id': year.id,
        'is_repeater': False
    }
}

try:
    student = service.save(data)
    print(f"Success: Student {student.id} created")
except Exception as e:
    import traceback
    print(f"Error: {e}")
    traceback.print_exc()
