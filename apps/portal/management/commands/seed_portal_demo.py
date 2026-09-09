from datetime import date

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.core.models.establishment import Establishment
from apps.hr.models.personnel import Personnel
from apps.profilmanagement.models import User
from apps.structure.models import AcademicYear, ClassRoom, Cycle, Level
from apps.students.models import Enrollment, Guardian, Student


class Command(BaseCommand):
    help = "Seed de données de démo pour tester le portail Eteyelo (magic link)."

    EST_NAME = "Ecole Demo Eteyelo"
    YEAR_NAME = "2025-2026"
    CLASSROOM_NAME = "Terminale S"

    def handle(self, *args, **options):
        est, _ = Establishment.objects.get_or_create(name=self.EST_NAME, defaults={
            "code": "DEMO-PORTAL",
            "city": "Libreville",
            "country": "Gabon",
            "phone": "+241060000000",
        })
        year, _ = AcademicYear.objects.get_or_create(
            name=self.YEAR_NAME, establishment=est,
            defaults={"start_date": date(2025, 9, 1), "end_date": date(2026, 7, 31), "is_active": True},
        )
        year.is_active = True
        year.save()

        cycle, _ = Cycle.objects.get_or_create(name="Secondaire", establishment=est, defaults={"order": 2})
        level, _ = Level.objects.get_or_create(name="Terminale", establishment=est, cycle=cycle, defaults={"short_name": "Tle", "order": 1})
        classroom, _ = ClassRoom.objects.get_or_create(
            name=self.CLASSROOM_NAME, level=level, academic_year=year, establishment=est,
            defaults={"capacity": 40},
        )

        # ---- Parent de démo (2 enfants -> test du sélecteur) ----
        parent_user, created = User.objects.get_or_create(
            username="demo.parent", email="parent.demo@eteyelo.test",
            defaults={"first_name": "Aline", "last_name": "MENGUE", "phone": "+241060000001"},
        )
        guardian, _ = Guardian.objects.get_or_create(
            phone_number="+241060000001", establishment=est,
            defaults={"user": parent_user, "first_name": "Aline", "last_name": "MENGUE", "role": "MOTHER"},
        )

        children_spec = [
            {"matricule": "DEMO-2026-001", "first_name": "Awa", "last_name": "MENGUE", "gender": "F"},
            {"matricule": "DEMO-2026-002", "first_name": "Samuel", "last_name": "MENGUE", "gender": "M"},
        ]
        for spec in children_spec:
            student, _ = Student.objects.get_or_create(
                matricule=spec["matricule"], establishment=est,
                defaults=spec,
            )
            guardian.students.add(student)
            if not Enrollment.objects.filter(student=student, academic_year=year).exists():
                Enrollment.objects.create(
                    student=student, classroom=classroom, academic_year=year,
                    establishment=est, status="REGISTERED",
                )

        # ---- Enseignant de démo ----
        prof_user, _ = User.objects.get_or_create(
            username="demo.prof", email="prof.martin@eteyelo.test",
            defaults={"first_name": "Jean", "last_name": "MARTIN", "phone": "+241060000002"},
        )
        Personnel.objects.get_or_create(
            user=prof_user, establishment=est,
            defaults={
                "matricule": "DEMO-PROF-001",
                "gender": "M",
                "job_title": "Enseignant de Mathématiques",
                "phone_number": "+241060000002",
                "email_pro": "prof.martin@eteyelo.test",
                "date_hired": date(2020, 9, 1),
            },
        )

        self.stdout.write(self.style.SUCCESS("✔ Seed portail Eteyelo terminé."))
        self.stdout.write("  Parent  (espace étudiant) : parent.demo@eteyelo.test ou +241060000001 (2 enfants)")
        self.stdout.write("  Enseignant (espace prof)  : prof.martin@eteyelo.test ou +241060000002")
        self.stdout.write("  En mode DEBUG, le code est renvoyé directement par l'API (/api/portal/auth/request/).")
