# -*- coding: utf-8 -*-
"""Tests des endpoints de santé (healthcheck / ping)."""
from .base import HubTestCase


class HealthPingTests(HubTestCase):
    def test_health_ok(self):
        resp = self.client.get("/api/core/health/")
        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertEqual(body["status"], "healthy")
        self.assertEqual(body["checks"]["database"], "ok")

    def test_ping_ok(self):
        resp = self.client.get("/api/external/ping/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "ready")

    def test_health_public(self):
        """Le healthcheck ne doit pas exiger d'authentification."""
        resp = self.client.get("/api/core/health/")
        self.assertEqual(resp.status_code, 200)
