"""
Garde-fou sécurité : le HubHandshakeMiddleware.
En mode Hub (ETHER_HUB_PID défini), toute requête /api/ ou /graphql
sans X-Hub-Session-Token valide doit être rejetée (403).
"""
import pytest
from django.http import HttpResponse
from django.test import RequestFactory

from apps.core.middleware.HubHandshakeMiddleware import HubHandshakeMiddleware


def _make_middleware():
    def get_response(request):
        return HttpResponse("ok")

    return HubHandshakeMiddleware(get_response)


@pytest.fixture
def factory():
    return RequestFactory()


def test_passes_through_outside_hub_mode(factory):
    request = factory.post("/api/product/save/")
    response = _make_middleware()(request)
    assert response.status_code == 200


def test_rejects_api_without_token_in_hub_mode(factory, monkeypatch):
    monkeypatch.setenv("ETHER_HUB_PID", "1234")
    monkeypatch.setenv("ETHER_SESSION_TOKEN", "secret")
    request = factory.post("/api/product/save/")
    response = _make_middleware()(request)
    assert response.status_code == 403


def test_accepts_api_with_valid_token(factory, monkeypatch):
    monkeypatch.setenv("ETHER_HUB_PID", "1234")
    monkeypatch.setenv("ETHER_SESSION_TOKEN", "secret")
    request = factory.post("/api/product/save/", HTTP_X_HUB_SESSION_TOKEN="secret")
    response = _make_middleware()(request)
    assert response.status_code == 200


def test_rejects_graphql_without_token(factory, monkeypatch):
    monkeypatch.setenv("ETHER_HUB_PID", "1234")
    monkeypatch.setenv("ETHER_SESSION_TOKEN", "secret")
    request = factory.post("/graphql", {"query": "{ debugMessage }"})
    response = _make_middleware()(request)
    assert response.status_code == 403


def test_login_route_always_bypassed(factory, monkeypatch):
    monkeypatch.setenv("ETHER_HUB_PID", "1234")
    request = factory.post("/api/auth/login/")
    response = _make_middleware()(request)
    assert response.status_code == 200
