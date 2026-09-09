# -*- coding: utf-8 -*-
"""Tests des middlewares : Licence, Handshake Hub, UUID, préfixe."""
from unittest.mock import patch

from .base import HubTestCase
from apps.core.models import Module, Page


class MiddlewareTests(HubTestCase):
    def setUp(self):
        super().setUp()
        # Page rattachée à un module (utilisée par LicenseMiddleware)
        self.page_locked = Page.objects.create(
            title="Page verrouillée",
            link="/module-locked",
            order=1,
            module=self.module_locked,
            permission_tags=["view_module_locked"],
        )

    # --- EstablishmentMiddleware ---

    def test_invalid_uuid_header_ignored(self):
        """[FIX v1.0] Un UUID malformé est ignoré au lieu de provoquer un 500."""
        resp = self.client.post(
            "/api/establishment/list/",
            {},
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
            HTTP_X_ESTABLISHMENT_ID="bad-uuid-value",
        )
        self.assertNotEqual(resp.status_code, 500)

    def test_valid_uuid_header_passed(self):
        resp = self.client.post(
            "/api/establishment/list/",
            {},
            format="json",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
            HTTP_X_ESTABLISHMENT_ID=str(self.establishment.id),
        )
        self.assertEqual(resp.status_code, 200)

    # --- LicenseMiddleware ---

    def test_license_middleware_superuser_bypass(self):
        """Le superuser ne doit jamais être bloqué par la licence."""
        resp = self.client.get(
            "/module-locked",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
            HTTP_X_ESTABLISHMENT_ID=str(self.establishment.id),
        )
        self.assertNotEqual(resp.status_code, 403)

    def test_license_middleware_blocks_non_superuser_without_license(self):
        """Un utilisateur sans licence sur le module est bloqué (403)."""
        resp = self.client.get(
            "/module-locked",
            HTTP_AUTHORIZATION=f"Bearer {self.stranger_token}",
            HTTP_X_ESTABLISHMENT_ID=str(self.establishment.id),
        )
        self.assertEqual(resp.status_code, 403)

    # --- HubHandshakeMiddleware ---

    def test_handshake_blocked_in_hub_mode_without_token(self):
        """En mode Hub, une requête API sans jeton de session est rejetée (403)."""
        with patch.dict("os.environ", {"ETHER_HUB_PID": "12345"}):
            resp = self.client.get("/api/core/health/")
            # health n'est pas sous /api/ (c'est /api/core/health/) -> vérifions
            # un chemin explicitement protégé par le handshake : /graphql ou /api/...
            resp = self.client.post(
                "/api/establishment/list/", {}, format="json"
            )
            self.assertEqual(resp.status_code, 403)

    def test_handshake_allowed_in_hub_mode_with_token(self):
        """En mode Hub, le bon jeton X-Hub-Session-Token laisse passer."""
        with patch.dict(
            "os.environ", {"ETHER_HUB_PID": "12345", "ETHER_SESSION_TOKEN": "secret-token"}
        ):
            resp = self.client.get(
                "/api/core/health/",
                HTTP_X_HUB_SESSION_TOKEN="secret-token",
            )
            self.assertEqual(resp.status_code, 200)

    def test_handshake_ignored_outside_hub_mode(self):
        """Hors mode Hub (dev), le handshake ne bloque rien."""
        resp = self.client.get("/api/core/health/")
        self.assertEqual(resp.status_code, 200)

    # --- HubPrefixMiddleware ---

    def test_prefix_stripped(self):
        """[FIX] Avec ETHER_APP_PREFIX, le préfixe est nettoyé pour le routage."""
        with patch.dict("os.environ", {"ETHER_APP_PREFIX": "/schoolmanage/test"}):
            resp = self.client.get(
                "/schoolmanage/test/api/core/health/",
                HTTP_HOST="testserver",
            )
            self.assertEqual(resp.status_code, 200)
