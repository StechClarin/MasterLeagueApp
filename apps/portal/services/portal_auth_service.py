"""
Service d'authentification du Portail Eteyelo par "magic link" à code court.

Flux :
1. POST /api/portal/auth/request/ {space, contact}  -> code 6 chiffres (email/SMS)
2. POST /api/portal/auth/verify/   {space, contact, code} -> JWT de session + profil

Résolution des profils réels :
- space=student : Guardian (parent/tuteur) identifié par téléphone (clé métier)
  ou email du compte lié ; repli Student (compte élève) par email/téléphone.
- space=prof    : Personnel (enseignant/agent) par email_pro, téléphone ou
  compte utilisateur lié.
"""

import hashlib
import hmac
import logging
import re
import secrets
from datetime import timedelta

import jwt
from django.conf import settings
from django.db.models import Q
from django.utils import timezone

from ..models import PortalOtp
from . import notification_service

logger = logging.getLogger("eteyelo.portal")

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class PortalAuthError(Exception):
    """Erreur métier du portail (message sûr, sans fuite d'information)."""

    def __init__(self, detail, status=400):
        self.detail = detail
        self.status = status
        super().__init__(detail)


class AlreadyRequestedError(PortalAuthError):
    pass


class InvalidCodeError(PortalAuthError):
    pass


def _is_email(value: str) -> bool:
    return bool(EMAIL_RE.match(value.strip().lower()))


def normalize_contact(contact: str):
    """Normalise un contact et retourne (kind, identifier).

    kind: 'email' | 'sms' ; identifier: email minuscule ou téléphone normalisé.
    """
    raw = (contact or "").strip()
    if not raw:
        raise PortalAuthError("Le contact (email ou téléphone) est requis.", 400)

    if _is_email(raw):
        return "email", raw.lower()

    digits = re.sub(r"[^\d]", "", raw)
    if len(digits) < 8 or len(digits) > 15:
        raise PortalAuthError("Numéro de téléphone invalide.", 400)

    # Normalisation internationale légère : 00XX -> +XX
    if raw.startswith("00") and not raw.startswith("+"):
        phone = "+" + digits
    elif raw.startswith("+"):
        phone = "+" + digits
    else:
        phone = digits
    return "sms", phone


def hash_code(code: str) -> str:
    """Hash le code avec HMAC-SHA256 + SECRET_KEY (jamais stocké en clair)."""
    secret = settings.SECRET_KEY.encode("utf-8")
    return hmac.new(secret, code.encode("utf-8"), hashlib.sha256).hexdigest()


def generate_code() -> str:
    """Génère un code numérique à 6 chiffres sécurisé."""
    return f"{secrets.randbelow(1_000_000):06d}"


def _phone_matches_exact(identifier: str, candidate: str) -> bool:
    """Compare un téléphone en gérant '+', '00' et espaces."""
    if not candidate:
        return False
    cand_digits = re.sub(r"[^\d]", "", candidate)
    ident_digits = identifier.lstrip("+")
    return cand_digits == ident_digits


def find_profile(space: str, kind: str, identifier: str):
    """Retourne {'kind', 'pk'} du profil réel correspondant, ou None.

    kind : 'email' | 'sms' (canal utilisé).
    """
    if space == PortalOtp.Space.STUDENT:
        # 1) Parent / tuteur : le téléphone est la clé métier (unique).
        if kind == "sms":
            guardians = list(Guardian.objects.filter(is_active=True).exclude(phone_number="0000"))
            for g in guardians:
                if _phone_matches_exact(identifier, g.phone_number):
                    return {"kind": "guardian", "pk": g.pk}
        # 2) Tuteur identifié par l'email de son compte utilisateur.
        elif kind == "email":
            g = Guardian.objects.filter(user__email__iexact=identifier, is_active=True).first()
            if g:
                return {"kind": "guardian", "pk": g.pk}

        # 3) Repli : un élève disposant d'un compte utilisateur.
        st = Student.objects.filter(
            Q(user__email__iexact=identifier) | Q(user__phone=identifier),
            is_active=True,
        ).first()
        if st:
            return {"kind": "student", "pk": st.pk}
        return None

    # ---- space = prof : Personnel par email pro, téléphone ou user lié ----
    query = Q(is_active=True)
    if kind == "email":
        query &= Q(email_pro__iexact=identifier) | Q(user__email__iexact=identifier)
    else:
        phone_core = identifier.lstrip("+")
        query &= Q(phone_number__icontains=phone_core) | Q(user__phone__icontains=phone_core)

    personnel = Personnel.objects.filter(query).order_by("pk").first()
    if personnel:
        return {"kind": "personnel", "pk": personnel.pk}
    return None


def _display_name(profile_kind, obj):
    """Nom d'affichage sûr pour chaque type de profil."""
    if profile_kind == "guardian":
        if getattr(obj, "user", None):
            full = f"{obj.user.first_name} {obj.user.last_name}".strip()
            if full:
                return full
        return f"{obj.first_name or ''} {obj.last_name or ''}".strip() or "Parent"
    if profile_kind == "personnel":
        if getattr(obj, "user", None):
            full = f"{obj.user.first_name} {obj.user.last_name}".strip()
            if full:
                return full
            return obj.user.email or ""
        return "Enseignant"
    # student
    return f"{obj.first_name} {obj.last_name}".strip()


def _pick_enrollment(student):
    """Choisit l'inscription la plus pertinente (année active, sinon la plus récente)."""
    enrollments = student.enrollments.order_by("-created_at").select_related(
        "classroom", "classroom__level", "academic_year"
    ).all()
    active = [e for e in enrollments if e.academic_year.is_active and e.status == "REGISTERED"]
    candidate = active[0] if active else (enrollments[0] if enrollments else None)
    return candidate


def _student_child_payload(student):
    enrollment = _pick_enrollment(student)
    return {
        "id": str(student.pk),
        "firstName": student.first_name,
        "lastName": student.last_name,
        "matricule": student.matricule or "",
        "gender": student.gender or "",
        "photo": student.photo.url if student.photo else None,
        "className": enrollment.classroom.name if enrollment else None,
        "levelName": enrollment.classroom.level.name if enrollment and enrollment.classroom.level else None,
        "academicYear": enrollment.academic_year.name if enrollment else None,
        "status": enrollment.status if enrollment else None,
        "establishmentId": str(enrollment.establishment_id if enrollment else student.establishment_id or ""),
        "establishmentName": enrollment.establishment.name if enrollment and enrollment.establishment_id else (
            student.establishment.name if student.establishment_id else None
        ),
    }

def resolve_person_context(profile):
    """
    Construit le contexte de session complet :
    {person: {...}, children: [...], space}
    Les enfants ne sont renseignés que pour les parents/tuteurs.
    """
    kind, pk = profile["kind"], profile["pk"]

    if kind == "guardian":
        g = Guardian.objects.select_related("user", "establishment").filter(pk=pk).first()
        if not g:
            raise PortalAuthError("Session invalide : profil introuvable.", 401)
        children = [_student_child_payload(st) for st in g.students.filter(is_active=True).order_by("last_name")]
        person = {
            "kind": "guardian",
            "id": str(g.pk),
            "firstName": getattr(g.user, "first_name", None) or (g.first_name or ""),
            "lastName": getattr(g.user, "last_name", None) or (g.last_name or ""),
            "name": _display_name("guardian", g),
            "phone": g.phone_number,
            "email": getattr(g.user, "email", None) or "",
        }
        return {"space": PortalOtp.Space.STUDENT, "person": person, "children": children}

    if kind == "student":
        st = Student.objects.select_related("establishment", "user").filter(pk=pk).first()
        if not st:
            raise PortalAuthError("Session invalide : profil introuvable.", 401)
        person = {
            "kind": "student",
            "id": str(st.pk),
            "firstName": st.first_name,
            "lastName": st.last_name,
            "name": _display_name("student", st),
            "phone": getattr(st.user, "phone", None) or "",
            "email": getattr(st.user, "email", None) or "",
        }
        return {
            "space": PortalOtp.Space.STUDENT,
            "person": person,
            "children": [_student_child_payload(st)],
        }

    # personnel
    p = Personnel.objects.select_related("user", "establishment").filter(pk=pk).first()
    if not p:
        raise PortalAuthError("Session invalide : profil introuvable.", 401)
    person = {
        "kind": "personnel",
        "id": str(p.pk),
        "name": _display_name("personnel", p),
        "firstName": getattr(p.user, "first_name", "") or "",
        "lastName": getattr(p.user, "last_name", "") or "",
        "email": p.email_pro or getattr(p.user, "email", "") or "",
        "phone": p.phone_number or getattr(p.user, "phone", "") or "",
        "matricule": p.matricule or "",
        "jobTitle": p.job_title or "",
        "establishmentId": str(p.establishment_id or ""),
        "establishmentName": p.establishment.name if p.establishment_id else None,
    }
    return {"space": PortalOtp.Space.PROF, "person": person, "children": []}

def request_otp(space: str, contact: str):
    """
    Etape 1 : demande d'envoi d'un code.

    Retourne un dict "sûr" prêt pour l'API :
      request_id, channel, identifier (masqué), expires_in, resend_after,
      debug_code (UNIQUEMENT si settings.DEBUG).
    """
    if space not in (PortalOtp.Space.STUDENT, PortalOtp.Space.PROF):
        raise PortalAuthError("Espace invalide : 'student' ou 'prof' attendu.", 400)

    kind, identifier = normalize_contact(contact)

    # Anti-spam : un code non expiré existe déjà pour ce contact ?
    now = timezone.now()
    existing = (
        PortalOtp.objects.filter(space=space, identifier=identifier, consumed_at__isnull=True)
        .exclude(expires_at__lte=now)
        .order_by("-created_at")
        .first()
    )
    if existing:
        elapsed = (now - existing.created_at).total_seconds()
        if elapsed < PortalOtp.RESEND_COOLDOWN_SECONDS:
            retry_after = int(PortalOtp.RESEND_COOLDOWN_SECONDS - elapsed)
            raise AlreadyRequestedError(
                f"Un code a déjà été envoyé. Réessayez dans {retry_after} secondes.", 429
            )

    # Résolution du profil (la réponse ne révèle PAS si le compte existe).
    profile = find_profile(space, kind, identifier)

    code = generate_code()
    otp = PortalOtp.objects.create(
        space=space,
        channel=kind,
        identifier=identifier,
        code_hash=hash_code(code),
        expires_at=now + timedelta(minutes=PortalOtp.TTL_MINUTES),
    )

    delivery = notification_service.deliver_otp(kind, identifier, code, space)

    payload = {
        "detail": "Si un compte est associé à ce contact, un code vient d'être envoyé.",
        "request_id": str(otp.request_id),
        "channel": delivery["channel"],
        "identifier": identifier,
        "expires_in": PortalOtp.TTL_MINUTES * 60,
        "resend_after": PortalOtp.RESEND_COOLDOWN_SECONDS,
    }
    if getattr(settings, "DEBUG", False):
        # Dev uniquement : permet de tester sans SMTP/SMS réel.
        payload["profile_found"] = profile is not None
        if profile is None:
            payload["detail"] = "Aucun compte trouvé pour ce contact (mode DEBUG)."
        if delivery.get("debug_code"):
            payload["debug_code"] = delivery["debug_code"]
    return payload


def verify_otp(space: str, contact: str, code: str):
    """
    Etape 2 : vérification du code et émission de la session.

    Consomme le code, résout le profil réel et retourne
    (token_payload, session_context).
    """
    if space not in (PortalOtp.Space.STUDENT, PortalOtp.Space.PROF):
        raise PortalAuthError("Espace invalide.", 400)
    kind, identifier = normalize_contact(contact)

    otp = (
        PortalOtp.objects.filter(space=space, identifier=identifier, consumed_at__isnull=True)
        .order_by("-created_at")
        .first()
    )
    now = timezone.now()

    if not otp or otp.expires_at <= now:
        raise InvalidCodeError("Code invalide ou expiré.", 400)
    if otp.attempts >= PortalOtp.MAX_ATTEMPTS:
        raise InvalidCodeError("Trop de tentatives. Redemandez un nouveau code.", 400)

    code = (code or "").strip()
    if not code.isdigit() or len(code) != 6:
        raise InvalidCodeError("Le code doit contenir exactement 6 chiffres.", 400)

    if not hmac.compare_digest(otp.code_hash, hash_code(code)):
        otp.attempts += 1
        otp.save(update_fields=["attempts"])
        remaining = PortalOtp.MAX_ATTEMPTS - otp.attempts
        if remaining <= 0:
            raise InvalidCodeError("Trop de tentatives. Redemandez un nouveau code.", 400)
        raise InvalidCodeError(f"Code incorrect. Encore {remaining} tentative(s).", 400)

    # Succès : on consomme le code et on résout le profil.
    otp.consumed_at = now
    otp.save(update_fields=["consumed_at"])

    profile = find_profile(space, kind, identifier)
    if not profile:
        raise InvalidCodeError("Code invalide ou expiré.", 400)

    context = resolve_person_context(profile)
    token = issue_portal_token(context)
    return token, context


def issue_portal_token(context: dict) -> dict:
    """Crée un JWT Eteyelo Portal (HS256) pour le contexte de session."""
    session_hours = getattr(settings, "PORTAL_SESSION_HOURS", 12)
    now = timezone.now()
    person = context["person"]
    claims = {
        "iss": "eteyelo-portal",
        "space": context["space"],
        "kind": person["kind"],
        "person_id": person["id"],
        "name": person.get("name", ""),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=session_hours)).timestamp()),
    }
    access_token = jwt.encode(claims, settings.SECRET_KEY, algorithm="HS256")
    return {
        "access_token": access_token,
        "token_type": "Bearer",
        "expires_in": session_hours * 3600,
    }


def decode_portal_token(token: str) -> dict:
    """Décode et valide un JWT Eteyelo Portal. Lève jwt.InvalidTokenError."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"], issuer="eteyelo-portal")


def context_from_token(token: str):
    """Reconstruit le contexte de session frais (données à jour) depuis un token."""
    claims = decode_portal_token(token)
    # Les PK peuvent être des UUID (Guardian/Student) ou des entiers (Personnel) :
    # on conserve toujours la forme texte pour interroger le modèle.
    profile = {"kind": claims["kind"], "pk": str(claims["person_id"])}
    context = resolve_person_context(profile)
    context["claims"] = claims
    return context


# Imports tardifs (évite les dépendances circulaires au chargement des apps)
from apps.hr.models.personnel import Personnel  # noqa: E402
from apps.students.models.guardian import Guardian  # noqa: E402
from apps.students.models.student import Student  # noqa: E402




