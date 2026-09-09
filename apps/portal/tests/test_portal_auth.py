"""
Tests du portail Eteyelo — authentification par magic link (code 6 chiffres).

Couvre :
- flux parent : request par téléphone -> debug_code (DEBUG) -> verify -> enfants
- flux enseignant : request par email -> verify -> profil personnel
- sécurité : code usage unique, limite de tentatives, cooldown d'envoi,
  session /session/ avec le jeton émis.
"""

from datetime import date

from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from apps.core.models.establishment import Establishment
from apps.hr.models.personnel import Personnel
from apps.profilmanagement.models import User
from apps.structure.models import AcademicYear, ClassRoom, Cycle, Level
from apps.students.models import Enrollment, Guardian, Student


@override_settings(DEBUG=True)
class PortalMagicLinkAuthTests(TestCase):
    def setUp(self):
        self.est = Establishment.objects.create(
            name="École Test Eteyelo",
            code="TEST-PORTAL",
            city="Libreville",
            country="Gabon",
        )
        self.year = AcademicYear.objects.create(
            name="2025-2026",
            establishment=self.est,
            start_date=date(2025, 9, 1),
            end_date=date(2026, 7, 31),
            is_active=True,
        )
        cycle = Cycle.objects.create(name="Secondaire", establishment=self.est)
        level = Level.objects.create(name="Terminale", establishment=self.est, cycle=cycle)
        self.classroom = ClassRoom.objects.create(
            name="Terminale S",
            level=level,
            academic_year=self.year,
            establishment=self.est,
        )

        # Parent + 2 enfants
        self.parent_user = User.objects.create_user(
            username="parent.test",
            email="parent.test@eteyelo.test",
            first_name="Aline",
            last_name="MENGUE",
            phone="+241060000001",
        )
        self.guardian = Guardian.objects.create(
            user=self.parent_user,
            phone_number="+241060000001",
            establishment=self.est,
            first_name="Aline",
            last_name="MENGUE",
            role="MOTHER",
        )
        self.students = []
        for i, fname in enumerate(["Awa", "Samuel"], start=1):
            st = Student.objects.create(
                matricule=f"TST-2026-00{i}",
                first_name=fname,
                last_name="MENGUE",
                gender="F" if i == 1 else "M",
                establishment=self.est,
            )
            self.guardian.students.add(st)
            Enrollment.objects.create(
                student=st,
                classroom=self.classroom,
                academic_year=self.year,
                establishment=self.est,
                status="REGISTERED",
            )
            self.students.append(st)

        # Enseignant
        self.prof_user = User.objects.create_user(
            username="prof.test",
            email="prof.test@eteyelo.test",
            first_name="Jean",
            last_name="MARTIN",
            phone="+241060000002",
        )
        Personnel.objects.create(
            user=self.prof_user,
            establishment=self.est,
            matricule="TST-PROF-001",
            gender="M",
            job_title="Enseignant",
            email_pro="prof.test@eteyelo.test",
            phone_number="+241060000002",
            date_hired=date(2020, 9, 1),
        )

        self.client = APIClient()
        self.parent_phone = "+241060000001"
        self.prof_email = "prof.test@eteyelo.test"

    # ------------------------------------------------------------------ utils
    def request_code(self, space, contact):
        return self.client.post(
            "/api/portal/auth/request/",
            {"space": space, "contact": contact},
            format="json",
        )

    def verify_code(self, space, contact, code):
        return self.client.post(
            "/api/portal/auth/verify/",
            {"space": space, "contact": contact, "code": code},
            format="json",
        )

    def test_parent_phone_full_flow(self):
        # 1) Demande de code par téléphone
        res = self.request_code("student", self.parent_phone)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["channel"], "sms")
        self.assertTrue(data["profile_found"])
        self.assertRegex(data["debug_code"], r"^\d{6}$")

        # 2) Vérification du code
        res = self.verify_code("student", self.parent_phone, data["debug_code"])
        self.assertEqual(res.status_code, 200, res.content)
        body = res.json()
        self.assertTrue(body["access_token"])
        self.assertEqual(body["person"]["kind"], "guardian")
        self.assertEqual(body["person"]["name"], "Aline MENGUE")
        # Un parent avec 2 enfants reçoit la liste complète.
        self.assertEqual(len(body["children"]), 2)
        names = {c["firstName"] for c in body["children"]}
        self.assertEqual(names, {"Awa", "Samuel"})
        first = body["children"][0]
        self.assertEqual(first["className"], "Terminale S")
        self.assertEqual(first["academicYear"], "2025-2026")
        self.assertEqual(first["establishmentName"], "École Test Eteyelo")

    def test_parent_email_flow(self):
        res = self.request_code("student", "parent.test@eteyelo.test")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["channel"], "email")

        res = self.verify_code("student", "parent.test@eteyelo.test", res.json()["debug_code"])
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["person"]["kind"], "guardian")

    def test_teacher_email_flow(self):
        res = self.request_code("prof", self.prof_email)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["channel"], "email")

        res = self.verify_code("prof", self.prof_email, data["debug_code"])
        self.assertEqual(res.status_code, 200, res.content)
        body = res.json()
        self.assertEqual(body["person"]["kind"], "personnel")
        self.assertEqual(body["person"]["name"], "Jean MARTIN")
        self.assertEqual(body["person"]["jobTitle"], "Enseignant")
        self.assertEqual(body["children"], [])

    def test_teacher_phone_flow(self):
        res = self.request_code("prof", "+241060000002")
        self.assertEqual(res.status_code, 200)
        res = self.verify_code("prof", "+241060000002", res.json()["debug_code"])
        self.assertEqual(res.status_code, 200, res.content)
        self.assertEqual(res.json()["person"]["kind"], "personnel")

    def test_code_is_single_use(self):
        res = self.request_code("student", self.parent_phone)
        code = res.json()["debug_code"]

        first = self.verify_code("student", self.parent_phone, code)
        self.assertEqual(first.status_code, 200)

        # Deuxième utilisation -> refusé
        second = self.verify_code("student", self.parent_phone, code)
        self.assertEqual(second.status_code, 400)
        self.assertIn("Code invalide ou expiré", second.json()["detail"])

    def test_wrong_code_increments_attempts_and_blocks(self):
        res = self.request_code("student", self.parent_phone)
        code = res.json()["debug_code"]

        for _ in range(5):
            wrong = self.verify_code("student", self.parent_phone, "000000")
            self.assertEqual(wrong.status_code, 400)

        # Même le bon code est désormais bloqué (5 tentatives épuisées).
        blocked = self.verify_code("student", self.parent_phone, code)
        self.assertEqual(blocked.status_code, 400)
        self.assertIn("Trop de tentatives", blocked.json()["detail"])

    def test_resend_cooldown_returns_429(self):
        first = self.request_code("student", self.parent_phone)
        self.assertEqual(first.status_code, 200)

        second = self.request_code("student", self.parent_phone)
        self.assertEqual(second.status_code, 429)

    def test_unknown_contact_does_not_leak(self):
        res = self.request_code("prof", "+241099999999")
        self.assertEqual(res.status_code, 200)
        # En DEBUG on indique qu'aucun compte n'existe (sinon message neutre).
        self.assertFalse(res.json()["profile_found"])

    def test_invalid_code_shape(self):
        res = self.request_code("student", self.parent_phone)
        wrong = self.verify_code("student", self.parent_phone, "12")
        self.assertEqual(wrong.status_code, 400)
        self.assertIn("6 chiffres", wrong.json()["detail"])

    def test_session_endpoint_rehydrates(self):
        res = self.request_code("student", self.parent_phone)
        token = self.verify_code("student", self.parent_phone, res.json()["debug_code"]).json()["access_token"]

        session = self.client.get(
            "/api/portal/session/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )
        self.assertEqual(session.status_code, 200)
        body = session.json()
        self.assertEqual(body["space"], "student")
        self.assertEqual(body["person"]["kind"], "guardian")
        self.assertEqual(len(body["children"]), 2)

    def test_session_rejects_bad_token(self):
        res = self.client.get("/api/portal/session/", HTTP_AUTHORIZATION="Bearer invalid.token.here")
        self.assertEqual(res.status_code, 401)

    def test_invalid_space_rejected(self):
        res = self.request_code("admin", self.parent_phone)
        self.assertEqual(res.status_code, 400)

