import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.evaluations.models import Grade
from apps.students.models import Student

student = Student.objects.filter(matricule="SAP-343301-9-CB8B").first()
if not student:
    print("Student not found")
else:
    print(f"Student: {student.id} {student.first_name} {student.last_name}")
    grades = Grade.objects.filter(student=student)
    print(f"Found {grades.count()} grades")
    for g in grades:
        print(f"Grade: {g.value} | Subject: {g.evaluation_subject.subject.name} | Period: {g.evaluation_subject.session.academic_period.id} {g.evaluation_subject.session.academic_period.name}")

