# -*- coding: utf-8 -*-
"""Tests des API externes (Bridge Hub) : provisioning, sync, unlock-module, assets."""
import uuid

from .base import HubTestCase
from apps.profilmanagement.models import User
from apps.core.models import TenantLicense


class ExternalApiTests(HubTestCase):
    def setUp(self):
        super().setUp()
        self.hub_id = f"hub-test-{uuid.uuid4().hex[:8]}"
        self.hk = {"HTTP_X_HUB_API_KEY": "ethernanos-hub-secret-2026"}

    # --- Provision Tenant ---

    def test_provision_invalid_key(self):
        resp = self.client.post(
            "/api/external/provision-tenant/",
            {"tenant_id": "x"},
            format="json",
            HTTP_X_HUB_API_KEY="bad-key",
        )
        self.assertEqual(resp.status_code, 401)

    def test_provision_missing_fields(self):
        resp = self.client.post(
            "/api/external/provision-tenant/", {}, format="json", **self.hk
        )
        self.assertEqual(resp.status_code, 400)

    def test_provision_success(self):
        resp = self.client.post(
            "/api/external/provision-tenant/",
            {
                "tenant_id": self.hub_id,
                "tenant_name": "École Test Hub",
                "hub_id": self.hub_id,
                "admin_email": f"{self.hub_id}@test.com",
                "included-mods": ["mod-finance"],
            },
            format="json",
            **self.hk,
        )
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(User.objects.filter(hub_id=self.hub_id).exists())

    # --- Sync Tenant ---

    def test_sync_tenant_missing_param(self):
        resp = self.client.get("/api/external/sync-tenant/", **self.hk)
        self.assertEqual(resp.status_code, 400)

    def test_sync_tenant_unknown(self):
        resp = self.client.get(
            "/api/external/sync-tenant/?tenant_id=unknown-hub", **self.hk
        )
        self.assertEqual(resp.status_code, 404)

    def test_sync_tenant_success(self):
        self.test_provision_success()
        resp = self.client.get(
            f"/api/external/sync-tenant/?tenant_id={self.hub_id}", **self.hk
        )
        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertIn("admin", body)
        self.assertIn("establishments", body)

    def test_sync_tenant_invalid_key(self):
        resp = self.client.get(
            "/api/external/sync-tenant/?tenant_id=x",
            HTTP_X_HUB_API_KEY="bad-key",
        )
        self.assertEqual(resp.status_code, 401)

    # --- Unlock Module ---

    def test_unlock_invalid_key(self):
        resp = self.client.post(
            "/api/external/unlock-module/",
            {"hub_id": self.hub_id, "module_code": "mod-finance"},
            format="json",
            HTTP_X_HUB_API_KEY="bad",
        )
        self.assertEqual(resp.status_code, 401)

    def test_unlock_owner_not_found(self):
        resp = self.client.post(
            "/api/external/unlock-module/",
            {"hub_id": "unknown-hub", "module_code": "mod-finance"},
            format="json",
            **self.hk,
        )
        self.assertEqual(resp.status_code, 404)

    def test_unlock_success_and_revoke(self):
        self.test_provision_success()
        # Activation
        resp = self.client.post(
            "/api/external/unlock-module/",
            {"hub_id": self.hub_id, "module_code": "mod-finance", "is_active": True},
            format="json",
            **self.hk,
        )
        self.assertEqual(resp.status_code, 200)
        owner = User.objects.get(hub_id=self.hub_id)
        self.assertTrue(
            TenantLicense.objects.get(user=owner, module_code="mod-finance").is_active
        )
        # Révocation
        resp = self.client.post(
            "/api/external/unlock-module/",
            {"hub_id": self.hub_id, "module_code": "mod-finance", "is_active": False},
            format="json",
            **self.hk,
        )
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(
            TenantLicense.objects.get(user=owner, module_code="mod-finance").is_active
        )

    def test_unlock_missing_fields(self):
        resp = self.client.post(
            "/api/external/unlock-module/",
            {"hub_id": self.hub_id},
            format="json",
            **self.hk,
        )
        self.assertEqual(resp.status_code, 400)

    # --- Sync Delta / Push Delta / Sync In ---

    def test_sync_delta_read(self):
        resp = self.client.get("/api/external/sync-delta/", **self.hk)
        self.assertEqual(resp.status_code, 200)

    def test_push_delta(self):
        resp = self.client.post(
            "/api/external/push-delta/", {"deltas": []}, format="json", **self.hk
        )
        self.assertEqual(resp.status_code, 200)

    def test_sync_in_invalid_key(self):
        resp = self.client.post(
            "/api/external/sync-in/", {}, format="json", HTTP_X_HUB_API_KEY="bad"
        )
        self.assertEqual(resp.status_code, 401)

    # --- Sync Assets ---

    def test_asset_manifest_unknown_tenant(self):
        resp = self.client.get(
            "/api/external/sync-assets/manifest/?tenant_id=unknown-hub", **self.hk
        )
        self.assertEqual(resp.status_code, 404)

    def test_asset_manifest_missing_tenant(self):
        resp = self.client.get("/api/external/sync-assets/manifest/", **self.hk)
        self.assertEqual(resp.status_code, 400)

    def test_asset_transfer_path_traversal(self):
        resp = self.client.get(
            "/api/external/sync-assets/transfer/?path=../../etc/passwd", **self.hk
        )
        self.assertEqual(resp.status_code, 403)

    def test_asset_transfer_missing_path(self):
        resp = self.client.get("/api/external/sync-assets/transfer/", **self.hk)
        self.assertEqual(resp.status_code, 400)
