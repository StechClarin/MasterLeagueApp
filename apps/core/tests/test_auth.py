# -*- coding: utf-8 -*-
"""Tests de l'authentification JWT (CustomTokenObtainPairView + refresh)."""
from .base import HubTestCase, SUPERUSER_PASSWORD, USER_PASSWORD


class AuthApiTests(HubTestCase):
    def test_login_success_username(self):
        resp = self.client.post(
            "/api/auth/login/",
            {"username": self.superuser.username, "password": SUPERUSER_PASSWORD},
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.assertIn("access", resp.json())
        self.assertIn("refresh", resp.json())

    def test_login_success_email(self):
        resp = self.client.post(
            "/api/auth/login/",
            {"username": self.superuser.email, "password": SUPERUSER_PASSWORD},
            format="json",
        )
        self.assertEqual(resp.status_code, 200)

    def test_login_wrong_password(self):
        resp = self.client.post(
            "/api/auth/login/",
            {"username": self.superuser.username, "password": "wrong-password"},
            format="json",
        )
        self.assertEqual(resp.status_code, 401)

    def test_login_unknown_user(self):
        resp = self.client.post(
            "/api/auth/login/",
            {"username": "ghost-user", "password": "x"},
            format="json",
        )
        self.assertEqual(resp.status_code, 401)

    def test_login_missing_fields(self):
        resp = self.client.post("/api/auth/login/", {}, format="json")
        self.assertEqual(resp.status_code, 400)

    def test_token_refresh_valid(self):
        login = self.client.post(
            "/api/auth/login/",
            {"username": self.superuser.username, "password": SUPERUSER_PASSWORD},
            format="json",
        ).json()
        resp = self.client.post(
            "/api/auth/refresh/", {"refresh": login["refresh"]}, format="json"
        )
        self.assertEqual(resp.status_code, 200)
        self.assertIn("access", resp.json())

    def test_token_refresh_invalid(self):
        resp = self.client.post(
            "/api/auth/refresh/", {"refresh": "invalid.token.here"}, format="json"
        )
        self.assertIn(resp.status_code, (400, 401))

    def test_jwt_contains_custom_claims(self):
        import base64
        import json

        payload = self.token.split(".")[1]
        payload += "=" * (-len(payload) % 4)
        claims = json.loads(base64.urlsafe_b64decode(payload))
        self.assertEqual(claims["username"], self.superuser.username)
        self.assertTrue(claims["is_superuser"])

    def test_router_requires_auth(self):
        resp = self.client.post("/api/establishment/list/", {}, format="json")
        self.assertEqual(resp.status_code, 401)

    def test_router_invalid_token(self):
        resp = self.client.post(
            "/api/establishment/list/",
            {},
            format="json",
            HTTP_AUTHORIZATION="Bearer invalid.token.here",
        )
        self.assertEqual(resp.status_code, 401)
