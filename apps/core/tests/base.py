"""
Socle de test GENERIQUE : verifie automatiquement le CONTRAT commun de
n'importe quel modele metier du framework (Etablissement-aware ou non).

Pour tester un modele, creez un fichier ``apps/<app>/tests/test_<modele>.py`` :

    from apps.core.tests.base import BaseModelTest

    class Test<Modele>Contract(BaseModelTest):
        model = Modele

        def payload(self, establishment, index=""):
            return {"name": "Objet" + index, ...}   # SANS establishment ni user (auto-injectes)

Le socle execute alors automatiquement :
    CREATE  - creation via le service + auto-injection etablissement + audit user
    READ    - get_by_id + isolation multi-tenant de list()
    UPDATE  - modification via service.save(instance)
    DELETE  - suppression via service.delete()
    API     - POST /api/<model>/save/ via le RouterController (superuser)
    GRAPHQL - query paginee (si gql_query / gql_response_key renseignes)

Hooks surchargeables :
    payload(est, index="")   -> dict de creation valide (obligatoire)
    relations_payload(est)   -> dict de relations imbriquees / M2M (optionnel)
    make_service()           -> service utilise (defaut : BaseService dynamique lie au modele)
    gql_query / gql_response_key / gql_query_args -> active le test GraphQL
"""
import pytest
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import status
from rest_framework.test import APIClient

from apps.core.services.BaseService import BaseService


class BaseModelTest:
    model = None
    service_class = None
    gql_query = None
    gql_response_key = None
    gql_query_args = "(page: 1, pageSize: 10)"

    # ------------------------------------------------------------------ #
    #  Hooks a surcharger dans le test du modele
    # ------------------------------------------------------------------ #
    def payload(self, establishment, index=""):
        raise NotImplementedError(
            f"{self.__class__.__name__}.payload() doit retourner un dict de creation valide."
        )

    def relations_payload(self, establishment):
        """Relations imbriquees / M2M facultatives (ex: {'stock_items': [...]})."""
        return {}

    def make_service(self):
        """Service utilise par les tests. Par defaut un BaseService lie au modele."""
        if self.service_class:
            return self.service_class()
        return type(
            f"Generic{self.model.__name__}Service",
            (BaseService,),
            {"model": self.model},
        )()

    # ------------------------------------------------------------------ #
    #  Helpers internes
    # ------------------------------------------------------------------ #
    @property
    def _is_establishment_aware(self):
        return hasattr(self.model, "establishment")

    @property
    def _is_establishment_model(self):
        return self.model.__name__ == "Establishment"

    def _create_payload(self, establishment, index=""):
        data = dict(self.payload(establishment, index=index))
        data.update(self.relations_payload(establishment))
        return data

    def _save(self, user, establishment, index=""):
        service = self.make_service()
        service.set_context(user, establishment.id)
        obj = service.save(self._create_payload(establishment, index=index))
        return service, obj

    # ------------------------------------------------------------------ #
    #  CREATE
    # ------------------------------------------------------------------ #
    @pytest.mark.django_db
    def test_create_via_service(self, user, establishment):
        service, obj = self._save(user, establishment)
        assert obj.pk is not None
        assert self.model.objects.filter(pk=obj.pk).exists()

    @pytest.mark.django_db
    def test_create_injects_establishment(self, user, establishment):
        if not self._is_establishment_aware:
            pytest.skip("Modele non lie a un etablissement")
        _, obj = self._save(user, establishment)
        assert obj.establishment_id == establishment.id

    @pytest.mark.django_db
    def test_create_injects_audit_user(self, user, establishment):
        if not hasattr(self.model, "created_by_user"):
            pytest.skip("Modele sans audit (created_by_user)")
        _, obj = self._save(user, establishment)
        assert obj.created_by_user_id == user.id

    # ------------------------------------------------------------------ #
    #  READ
    # ------------------------------------------------------------------ #
    @pytest.mark.django_db
    def test_get_by_id(self, user, establishment):
        service, obj = self._save(user, establishment)
        assert service.get_by_id(obj.pk).pk == obj.pk

    @pytest.mark.django_db
    def test_list_filters_by_establishment(self, user, establishment, other_establishment):
        if not self._is_establishment_aware or self._is_establishment_model:
            pytest.skip("Pas d'isolation tenant pour ce modele")
        self._save(user, establishment)
        self._save(user, other_establishment, index="-B")

        service = self.make_service()
        service.set_context(user, establishment.id)
        assert service.list().count() == 1
        assert service.list().first().establishment_id == establishment.id

    # ------------------------------------------------------------------ #
    #  UPDATE
    # ------------------------------------------------------------------ #
    # Champs spéciaux exclus de la mise à jour générique (write-only / gérés à part)
    SPECIAL_UPDATE_FIELDS = {"password", "password2", "is_deleted"}

    @pytest.mark.django_db
    def test_update_via_service(self, user, establishment):
        service, obj = self._save(user, establishment)
        text_field = next(
            (
                f
                for f in self.model._meta.fields
                if f.get_internal_type() in ("CharField", "TextField")
                and f.editable
                and not f.primary_key
                and not f.unique
                and f.name not in self.SPECIAL_UPDATE_FIELDS
            ),
            None,
        )
        if text_field is None:
            pytest.skip("Aucun champ texte modifiable pour tester l'update")
        new_value = f"{getattr(obj, text_field.name)}-upd"
        service.save({text_field.name: new_value}, instance=obj)
        obj.refresh_from_db()
        assert getattr(obj, text_field.name) == new_value

    # ------------------------------------------------------------------ #
    #  DELETE
    # ------------------------------------------------------------------ #
    @pytest.mark.django_db
    def test_delete_via_service(self, user, establishment):
        service, obj = self._save(user, establishment)
        service.delete(obj)
        with pytest.raises(ObjectDoesNotExist):
            self.model.objects.get(pk=obj.pk)

    # ------------------------------------------------------------------ #
    #  API REST (RouterController : /api/<model>/save/)
    # ------------------------------------------------------------------ #
    @pytest.mark.django_db
    def test_api_save_endpoint(self, superuser, establishment):
        model_name = self.model._meta.model_name
        client = APIClient()
        client.force_authenticate(user=superuser)
        client.defaults["HTTP_X_ESTABLISHMENT_ID"] = str(establishment.id)

        resp = client.post(
            f"/api/{model_name}/save/",
            self._create_payload(establishment),
            format="json",
        )
        if resp.status_code in (status.HTTP_404_NOT_FOUND, status.HTTP_405_METHOD_NOT_ALLOWED):
            pytest.skip(f"Entite '{model_name}' non cablee pour l'API (controller/serializer ?)")
        assert resp.status_code in (status.HTTP_200_OK, status.HTTP_201_CREATED), resp.content

    # ------------------------------------------------------------------ #
    #  GRAPHQL (optionnel : active si gql_query / gql_response_key)
    # ------------------------------------------------------------------ #
    @pytest.mark.django_db
    def test_graphql_list_query(self, user, establishment):
        if not self.gql_query or not self.gql_response_key:
            pytest.skip("Renseignez gql_query / gql_response_key pour activer ce test")
        client = APIClient()
        client.force_authenticate(user=user)
        client.defaults["HTTP_X_ESTABLISHMENT_ID"] = str(establishment.id)

        query = "{ %s %s { items { id } totalCount } }" % (self.gql_query, self.gql_query_args)
        resp = client.post("/graphql", {"query": query}, format="json")
        assert resp.status_code == 200
        body = resp.json()
        assert "errors" not in body, body
        assert body["data"][self.gql_response_key]["totalCount"] >= 0
