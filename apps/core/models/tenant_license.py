# apps/core/models/tenant_license.py
from django.db import models
from django.conf import settings
from .user_audit_model import UserAuditModel

class TenantLicense(UserAuditModel):
    """
    Modèle de stockage des licences de modules déverrouillés par Propriétaire (Tenant / User).
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="licenses",
        verbose_name="Propriétaire (Owner)",
        null=True,
        blank=True
    )
    module_code = models.CharField(
        max_length=100,
        help_text="Code technique unique du module (ex: mod-finance)",
        verbose_name="Code du Module"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Définit si le module est débloqué par la licence",
        verbose_name="Est Actif"
    )
    allowed_pages = models.JSONField(
        default=list,
        blank=True,
        help_text="Liste des tags/pages autorisés pour ce module. Si vide, toutes les pages du module sont autorisées.",
        verbose_name="Pages Autorisées"
    )

    class Meta:
        unique_together = ['user', 'module_code']
        verbose_name = "Licence Tenant"
        verbose_name_plural = "Licences Tenants"

    def __str__(self):
        username = getattr(self.user, 'username', 'N/A') if self.user else "N/A"
        hub_id = getattr(self.user, 'hub_id', 'N/A') if self.user else "N/A"
        return f"{username} (Hub: {hub_id}) -> {self.module_code} ({'Actif' if self.is_active else 'Inactif'})"

    @classmethod
    def verify_access(cls, request, establishment_id, codename):
        """
        Vérifie si la licence de l'établissement autorise l'accès pour un codename de permission donné.
        Utilise un cache au niveau du cycle de vie de la requête pour optimiser les performances.
        """
        if not establishment_id:
            return True

        if not hasattr(request, '_license_access_cache'):
            request._license_access_cache = {}

        cache_key = f"{establishment_id}:{codename}"
        if cache_key in request._license_access_cache:
            return request._license_access_cache[cache_key]

        from apps.core.models import Permission, Page, Establishment
        
        # 1. Récupération de la permission et de son tag
        perm = Permission.objects.filter(codename=codename).first()
        if not perm or not perm.tag:
            request._license_access_cache[cache_key] = True
            return True

        # 2. Récupération de la page et du module liés à ce tag
        page = Page.objects.filter(permission_tags__contains=perm.tag).first()
        if not page:
            request._license_access_cache[cache_key] = True
            return True

        module = page.module
        core_codes = ['mod-referentiel', 'mod-administration']
        if module.code in core_codes:
            request._license_access_cache[cache_key] = True
            return True

        # 3. Vérification de la licence pour ce module
        from django.core.exceptions import ObjectDoesNotExist
        try:
            est = Establishment.objects.get(id=establishment_id)
        except ObjectDoesNotExist:
            request._license_access_cache[cache_key] = False
            return False

        licence = cls.objects.filter(
            user=est.user,
            module_code=module.code,
            is_active=True
        ).first()

        if not licence:
            request._license_access_cache[cache_key] = False
            return False

        # 4. Si la licence a des restrictions, le tag de la permission doit être présent
        if licence.allowed_pages:
            if perm.tag not in licence.allowed_pages:
                request._license_access_cache[cache_key] = False
                return False

        request._license_access_cache[cache_key] = True
        return True
