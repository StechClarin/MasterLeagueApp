"""
Fixtures partagées pour toute la suite de tests (apps/**/tests/).

Elles fournissent le contexte multi-tenant minimal :
    - establishment / other_establishment : les 2 tenants (isolation)
    - user : utilisateur propriétaire (is_owner) de 'establishment'
    - superuser : bypass RBAC + licence (maintenance) pour les tests API
    - api_client : client HTTP Django avec auth
"""
import pytest
from django.contrib.auth import get_user_model

from apps.core.models import Establishment, EstablishmentMembership

User = get_user_model()


@pytest.fixture
def establishment(db):
    """Établissement de test A (tenant)."""
    return Establishment.objects.create(
        name="Établissement Alpha",
        code="EST-ALPHA",
    )


@pytest.fixture
def other_establishment(db):
    """Second établissement, pour vérifier l'isolation multi-tenant."""
    return Establishment.objects.create(
        name="Établissement Bêta",
        code="EST-BETA",
    )


@pytest.fixture
def user(db, establishment):
    """Utilisateur standard, propriétaire (is_owner=True) de 'establishment'."""
    u = User.objects.create_user(
        username="boss", email="boss@example.com", password="pw12345"
    )
    EstablishmentMembership.objects.create(
        user=u,
        establishment=establishment,
        status="active",
        is_owner=True,
    )
    return u


@pytest.fixture
def superuser(db):
    """Super-user : le RouterController le fait passer au-dessus du RBAC et des licences."""
    return User.objects.create_superuser(
        username="root", email="root@example.com", password="pw12345"
    )


@pytest.fixture
def api_client():
    from rest_framework.test import APIClient

    return APIClient()
