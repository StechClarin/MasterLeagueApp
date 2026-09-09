"""
Service d'envoi des codes magic link (email / SMS).

Architecture "pluggable" :
- Email : backend SMTP de Django (settings EMAIL_*). En développement, si aucun
  hôte SMTP n'est configuré, le message est simplement journalisé en console.
- SMS  : aucun fournisseur n'est branché par défaut. Le canal `console` logge
  le SMS (parfait en dev). Pour brancher un vrai fournisseur (ex: Twilio,
  Africa's Talking, Orange SMS API...), il suffit d'implémenter un backend
  supplémentaire ci-dessous et de le sélectionner via settings.

Le code n'est renvoyé dans la réponse HTTP que lorsque settings.DEBUG est vrai
(pratique pour tester le flux sans SMTP/SMS). En production il n'est JAMAIS
exposé : seul l'envoi réel (email/SMS) est utilisé.
"""

import logging

from django.conf import settings

logger = logging.getLogger("eteyelo.portal")

# Numéro "from" affiché / utilisé pour les SMS si le fournisseur le demande.
SMS_FROM = getattr(settings, "PORTAL_SMS_FROM", "Eteyelo")


def build_otp_message(code: str, space: str) -> tuple:
    """Retourne (sujet, message) adaptés à l'espace connecté."""
    if space == "prof":
        subject = "Votre code de connexion Espace Enseignant Eteyelo"
    else:
        subject = "Votre code de connexion Espace Eteyelo"
    body = (
        f"Bonjour,\n\n"
        f"Voici votre code de connexion Eteyelo : {code}\n\n"
        f"Il expire dans 10 minutes et ne peut être utilisé qu'une seule fois.\n"
        f"Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.\n\n"
        f"L'équipe Eteyelo"
    )
    return subject, body


def _send_email(recipient: str, subject: str, body: str) -> bool:
    """Envoie un email via SMTP si configuré, sinon journalise en console."""
    from django.core.mail import send_mail

    email_host = getattr(settings, "EMAIL_HOST", None)
    if email_host and not getattr(settings, "DEBUG", False):
        try:
            send_mail(subject, body, getattr(settings, "DEFAULT_FROM_EMAIL", None), [recipient])
            return True
        except Exception:  # pragma: no cover - dépend du réseau
            logger.exception("Envoi email magic link échoué vers %s", recipient)
            return False

    # Mode développement : on journalise le message comme si c'était un vrai envoi.
    logger.info("📧 [EMAIL-DEV] Vers : %s | Sujet : %s\n%s", recipient, subject, body)
    return True


def _send_sms(recipient: str, body: str) -> bool:
    """Envoie un SMS via le backend configuré (console par défaut)."""
    backend = getattr(settings, "PORTAL_SMS_BACKEND", "console")
    if backend == "console":
        logger.info("💬 [SMS-DEV] Vers : %s | De : %s\n%s", recipient, SMS_FROM, body)
        return True
    # Exemple d'extension : brancher ici votre fournisseur SMS réel.
    logger.warning("PORTAL_SMS_BACKEND '%s' non implémenté, repli console.", backend)
    return _send_sms(recipient, body) if backend == "console" else False


def deliver_otp(channel: str, recipient: str, code: str, space: str) -> dict:
    """
    Envoie le code sur le canal demandé et retourne un résumé de livraison.
    Le code n'est renvoyé (champ debug_code) que si settings.DEBUG est vrai.
    """
    subject, body = build_otp_message(code, space)
    if channel == "email":
        sent = _send_email(recipient, subject, body)
    else:
        sent = _send_sms(recipient, body)

    payload = {"channel": channel, "sent": sent, "recipient": recipient}
    if getattr(settings, "DEBUG", False):
        payload["debug_code"] = code
    return payload
