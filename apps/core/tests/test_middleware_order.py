"""
Garde-fou P0 : l'ordre des middlewares.
LicenseMiddleware dépend de request.user (JWTMiddleware) ET de
request.establishment_id (EstablishmentMiddleware) => il DOIT venir après les deux.
"""
import os

import pytest

JWT = "apps.core.middleware.JWTMiddleware"
EST = "apps.core.middleware.EstablishmentMiddleware"
LIC = "apps.core.middleware.LicenseMiddleware"


def _assert_ordering(middleware):
    assert JWT in middleware, "JWTMiddleware manquant"
    assert EST in middleware, "EstablishmentMiddleware manquant"
    assert LIC in middleware, "LicenseMiddleware manquant"
    assert middleware.index(JWT) < middleware.index(EST), \
        "JWTMiddleware doit précéder EstablishmentMiddleware"
    assert middleware.index(EST) < middleware.index(LIC), \
        "EstablishmentMiddleware doit précéder LicenseMiddleware"


def test_dev_middleware_order():
    from django.conf import settings

    _assert_ordering(settings.MIDDLEWARE)


def test_hub_middleware_order():
    # settings_hub exige SECRET_KEY (P0) -> on la fournit pour l'import de test
    os.environ.setdefault("SECRET_KEY", "test-secret-key-hub")
    import config.settings_hub as hub

    _assert_ordering(hub.MIDDLEWARE)
