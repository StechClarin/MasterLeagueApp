# -*- coding: utf-8 -*-
"""Tests du routeur REST (CUD) : list, save, delete, export, contraintes."""
import uuid as uuid_mod

from .base import HubTestCase
from apps.core.models import Module


class RouterApiTests(HubTestCase):
    def test_list_with_context(self):
        resp = self.post_api(
            "/api/establishment/list/",
            token=self.token,
            est_id=self.establishment.id,
        )
        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertEqual(body["status"], "success")
        self.assertGreaterEqual(body["data"]["count"], 1)
        names = [e["name"] for e in body["data"]["results"]]
        self.assertIn(self.establishment.name, names)

    def test_list_via_get(self):
        resp = self.get_api(
            "/api/establishment/list/",
            token=self.token,
            est_id=self.establishment.id,
        )
        self.assertEqual(resp.status_code, 200)

    def test_unknown_controller_404(self):
        resp = self.post_api("/api/nonexistent/save/", {"name": "x"}, token=self.token)
        self.assertEqual(resp.status_code, 404)

    def test_unknown_method_405(self):
        resp = self.post_api("/api/establishment/hack/", {}, token=self.token)
        self.assertEqual(resp.status_code, 405)

    def test_auth_through_router_forbidden(self):
        """L'auth ne doit pas transiter par le routeur générique."""
        resp = self.post_api("/api/auth/save/", {}, token=self.token)
        self.assertEqual(resp.status_code, 404)

    def test_create_and_update(self):
        code = f"mod-test-{uuid_mod.uuid4().hex[:6]}"
        name = f"Module {uuid_mod.uuid4().hex[:6]}"
        resp = self.post_api(
            "/api/module/save/",
            {"code": code, "name": name, "is_active": True},
            token=self.token,
        )
        self.assertIn(resp.status_code, (200, 201))
        data = resp.json()["data"]
        self.assertEqual(data["name"], name)
        created_id = data["id"]

        # Mise à jour
        resp = self.post_api(
            "/api/module/save/",
            {"id": created_id, "code": code, "name": name + " V2", "is_active": False},
            token=self.token,
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["data"]["name"], name + " V2")

        # Nettoyage
        Module.objects.filter(pk=created_id).delete()

    def test_shallow_copy_querydict_with_uploaded_file(self):
        """
        [FIX v1.0] Le `request.data.copy()` de DRF fait un deepcopy du QueryDict.
        En multipart, DRF fusionne les fichiers dans le QueryDict : quand l'upload
        est temporaire (fichier > FILE_UPLOAD_MAX_MEMORY_SIZE), le deepcopy tente
        de sérialiser le flux BufferedRandom -> TypeError 'cannot pickle'.
        `_shallow_copy_data` doit renvoyer une copie MUTABLE sans deep-copy.
        """
        import tempfile

        from django.http import QueryDict

        from apps.core.api.controllers.establishment_controller import EstablishmentController

        # Reproduit le flux d'un upload temporaire (BufferedRandom) non deep-copiable
        tmp = tempfile.NamedTemporaryFile()
        try:
            tmp.write(b"\x89PNG\r\n\x1a\n")
            tmp.flush()
            # Reconstruit exactement ce que DRF expose dans request.data :
            # un QueryDict dont on a fait .copy() puis .update(files)
            merged = QueryDict("name=Ecole A&code=ET-01").copy()
            merged.update({"logo": tmp.file})

            # Sans le fix, cette copie classique échouait (deepcopy du BufferedRandom)
            with self.assertRaises(TypeError):
                merged.copy()

            clone = EstablishmentController._shallow_copy_data(merged)
            self.assertTrue(hasattr(clone, "setlist"))  # QueryDict (formulaire)
            self.assertEqual(clone.get("name"), "Ecole A")
            self.assertIs(clone["logo"], tmp.file)  # références conservées, pas de deepcopy
            # Copie MUTABLE : les services injectent des champs (ex: establishment_id)
            clone["establishment_id"] = "123e4567-e89b-12d3-a456-426614174000"
            self.assertEqual(clone["establishment_id"], "123e4567-e89b-12d3-a456-426614174000")
        finally:
            tmp.close()

    def test_save_establishment_with_logo_multipart(self):
        """
        [FIX v1.0] POST /api/establishment/save/ en multipart/form-data avec un
        fichier (logo) ne doit PAS renvoyer 500 (deepcopy BufferedRandom).
        On force un upload TEMPORAIRE (FILE_UPLOAD_MAX_MEMORY_SIZE réduit) pour
        reproduire le crash originel constaté en production.
        """
        import io
        import os
        import tempfile

        from django.core.files.uploadedfile import SimpleUploadedFile

        from PIL import Image

        # Création initiale en JSON (sans fichier)
        code = f"est-{uuid_mod.uuid4().hex[:8]}"
        name = f"Etablissement {uuid_mod.uuid4().hex[:8]}"
        resp = self.post_api(
            "/api/establishment/save/",
            {"name": name, "code": code, "city": "Yaounde", "country": "Cameroun", "is_active": True},
            token=self.token,
        )
        self.assertIn(resp.status_code, (200, 201), resp.content)
        est_id = resp.json()["data"]["id"]

        # PNG "bruité" volontairement > 1024 octets -> upload temporaire (BufferedRandom)
        buf = io.BytesIO()
        noise = Image.frombytes("RGB", (64, 64), os.urandom(64 * 64 * 3))
        noise.save(buf, format="PNG")
        logo = SimpleUploadedFile("logo.png", buf.getvalue(), content_type="image/png")
        self.assertGreater(len(buf.getvalue()), 1024)

        headers = self.auth(self.token, self.establishment.id)
        with tempfile.TemporaryDirectory() as media_root, self.settings(
            MEDIA_ROOT=media_root,
            FILE_UPLOAD_MAX_MEMORY_SIZE=1024,
        ):
            resp = self.client.post(
                "/api/establishment/save/",
                {
                    "id": str(est_id),
                    "name": name,
                    "code": code,
                    "city": "Yaounde",
                    "country": "Cameroun",
                    "is_active": "true",
                    "logo": logo,
                },
                format="multipart",
                **headers,
            )

        self.assertIn(resp.status_code, (200, 201), resp.content)
        body = resp.json()
        self.assertEqual(body["status"], "success")
        self.assertIsNotNone(body["data"].get("logo"))

    def test_delete(self):
        m = Module.objects.create(code="mod-del", name="À supprimer", is_active=True)
        resp = self.post_api(
            f"/api/module/delete/{m.id}/", {}, token=self.token
        )
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(Module.objects.filter(pk=m.pk).exists())

    def test_export_csv_works(self):
        """[FIX v1.0] L'export CSV doit renvoyer un fichier et non 404/500."""
        resp = self.get_api(
            "/api/establishment/export_data/?format=csv",
            token=self.token,
            est_id=self.establishment.id,
        )
        self.assertEqual(resp.status_code, 200)
        self.assertIn("text/csv", resp["Content-Type"])
        self.assertIn("attachment", resp["Content-Disposition"])
        self.assertIn("id", resp.content.decode("utf-8", "replace")[:200])

    def test_export_excel_works(self):
        resp = self.get_api(
            "/api/establishment/export_data/?format=excel",
            token=self.token,
            est_id=self.establishment.id,
        )
        self.assertEqual(resp.status_code, 200)
        self.assertIn("spreadsheet", resp["Content-Type"])

    def test_export_invalid_format(self):
        resp = self.get_api(
            "/api/establishment/export_data/?format=xml",
            token=self.token,
            est_id=self.establishment.id,
        )
        self.assertEqual(resp.status_code, 400)

    def test_import_without_file(self):
        resp = self.post_api("/api/module/import_data/", {}, token=self.token)
        self.assertEqual(resp.status_code, 400)

    def test_import_template(self):
        resp = self.get_api(
            "/api/module/import_template/", token=self.token
        )
        self.assertEqual(resp.status_code, 200)

    def test_list_unauthorized(self):
        resp = self.client.post("/api/establishment/list/", {}, format="json")
        self.assertEqual(resp.status_code, 401)

    def test_invalid_establishment_header_no_500(self):
        """[FIX v1.0] Un X-Establishment-ID malformé ne doit plus provoquer un 500."""
        resp = self.post_api(
            "/api/establishment/list/",
            token=self.token,
            est_id="not-a-uuid",
        )
        self.assertIn(resp.status_code, (200, 400, 403))
