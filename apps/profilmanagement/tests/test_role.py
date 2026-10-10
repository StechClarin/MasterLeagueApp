"""
Contrat de test du modèle Role (profilmanagement) via le socle générique.

Role a deux relations M2M (groups, permissions) : le payload fournit
les listes vides nécessaires à la validation du RoleSerializer.
La query GraphQL réelle 'roles' est activée.
"""
from apps.core.tests.base import BaseModelTest
from apps.profilmanagement.models import Role
from apps.profilmanagement.services.role_service import RoleService


class TestRoleContract(BaseModelTest):
    model = Role
    service_class = RoleService
    gql_query = "roles"
    gql_response_key = "roles"

    def payload(self, establishment, index=""):
        return {
            "name": f"role{index}",
            "permissions": [],
            "groups": [],
        }
