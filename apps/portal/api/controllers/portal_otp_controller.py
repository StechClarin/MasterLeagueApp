from apps.portal.models import PortalOtp


class PortalOtpController:
    """
    Contrôleur nominal pour le modèle PortalOtp.

    Les codes magic link sont gérés exclusivement par les endpoints dédiés
    du portail (/api/portal/auth/request/ et /api/portal/auth/verify/) :
    ils ne doivent JAMAIS transiter par le routeur générique CUD.
    Cette classe existe uniquement pour satisfaire le check d'architecture
    (apps.core.checks) qui exige un contrôleur par modèle métier.
    """

    model = PortalOtp
