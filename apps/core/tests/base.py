# -*- coding: utf-8 -*-
"""
Base commune pour les tests du Hub Ethernanos.
Fournit les données de test et les helpers d'authentification.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.core.models import Establishment, EstablishmentMembership, Module, Page, TenantLicense

User = get_user_model()

SUPERUSER_PASSWORD = "admin1234"
USER_PASSWORD = "user1234"


class HubTestCase(TestCase):
    """TestCase de base avec données standard : superuser, user, établissement, modules."""

    def setUp(self):
        self.client = APIClient()

        # 1. Super Admin (bypass licence/permissions)
        self.superuser = User.objects.create_superuser(
            username="ethernanos-test",
            email="ethernanos-test@hub.local",
            password=SUPERUSER_PASSWORD,
        )

        # 2. Utilisateur classique (propriétaire d'un établissement)
        self.user = User.objects.create_user(
            username="owner-test",
            email="owner-test@hub.local",
            password=USER_PASSWORD,
        )

        # 3. Utilisateur sans accès
        self.stranger = User.objects.create_user(
            username="stranger-test",
            email="stranger-test@hub.local",
            password=USER_PASSWORD,
        )

        # 4. Établissement + membership propriétaire
        self.establishment = Establishment.objects.create(
            user=self.user,
            name="École de Test",
            code="TEST-EST-001",
            city="Douala",
            country="Cameroun",
            is_active=True,
        )
        EstablishmentMembership.objects.create(
            user=self.user,
            establishment=self.establishment,
            is_owner=True,
            status="active",
        )

        # 5. Modules (dont un verrouillé par licence)
        self.module_finance = Module.objects.create(
            code="mod-finance", name="Finance", is_active=True
        )
        self.module_locked = Module.objects.create(
            code="mod-locked", name="Module Verrouillé", is_active=False
        )

        # 6. Licences
        self.license_finance = TenantLicense.objects.create(
            user=self.user,
            module_code="mod-finance",
            is_active=True,
        )

        # 7. Jetons
        self.token = self.obtain_token(self.superuser)
        self.user_token = self.obtain_token(self.user)
        self.stranger_token = self.obtain_token(self.stranger)

    # --- Helpers ---

    def obtain_token(self, user):
        password = SUPERUSER_PASSWORD if user.is_superuser else USER_PASSWORD
        resp = self.client.post(
            "/api/auth/login/",
            {"username": user.username, "password": password},
            format="json",
        )
        self.assertEqual(resp.status_code, 200, resp.content)
        return resp.json()["access"]

    def auth(self, token=None, est_id=None):
        """Headers d'authentification pour APIClient."""
        headers = {}
        if token:
            headers["HTTP_AUTHORIZATION"] = f"Bearer {token}"
        if est_id:
            headers["HTTP_X_ESTABLISHMENT_ID"] = str(est_id)
        return headers

    def post_api(self, url, data=None, token=None, est_id=None, **extra):
        """POST générique sur le routeur REST avec contexte."""
        headers = self.auth(token, est_id)
        headers.update(extra)
        return self.client.post(url, data=data or {}, format="json", **headers)

    def get_api(self, url, token=None, est_id=None, **extra):
        headers = self.auth(token, est_id)
        headers.update(extra)
        return self.client.get(url, **headers)

    def graphql(self, query, token=None, est_id=None, variables=None):
        """POST GraphQL avec contexte."""
        headers = self.auth(token, est_id)
        payload = {"query": query}
        if variables:
            payload["variables"] = variables
        return self.client.post("/graphql", payload, format="json", **headers)
