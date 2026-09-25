import uuid
from django.db import models


class PortalOtp(models.Model):
    """
    Jeton d'authentification "magic link" à code court (6 chiffres).
    Envoyé par email ou SMS, haché en base (HMAC-SHA256), à usage unique.

    Aucune FK volontaire : on stocke uniquement l'identifiant de contact
    normalisé (email / téléphone). Le rattachement au profil (Guardian,
    Student, Personnel) est résolu au moment du request / verify, ce qui
    évite toute fuite d'information lors d'une requête sur un compte inconnu.
    """

    class Space(models.TextChoices):
        STUDENT = "student", "Espace étudiant / parent"
        PROF = "prof", "Espace enseignant"
        MANAGER = "manager", "Espace gestionnaire / directeur"

    class Channel(models.TextChoices):
        EMAIL = "email", "Email"
        SMS = "sms", "SMS"

    # Durée de validité d'un code
    TTL_MINUTES = 10
    # Nombre maximal de tentatives de saisie d'un code
    MAX_ATTEMPTS = 5
    # Délai minimal entre deux envois pour un même contact (anti-spam)
    RESEND_COOLDOWN_SECONDS = 90

    request_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    space = models.CharField(max_length=10, choices=Space.choices)
    channel = models.CharField(max_length=10, choices=Channel.choices)
    identifier = models.CharField(max_length=255, db_index=True, help_text="Email ou téléphone normalisé")
    code_hash = models.CharField(max_length=64, help_text="HMAC-SHA256 du code à 6 chiffres")
    attempts = models.PositiveSmallIntegerField(default=0)
    expires_at = models.DateTimeField()
    consumed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "code magic link (portail)"
        verbose_name_plural = "codes magic link (portail)"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.space}] {self.identifier} -> {self.channel}"
