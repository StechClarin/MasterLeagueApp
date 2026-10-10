"""
Contrat de test du modèle User (profilmanagement) via le socle générique.

Ce fichier montre comment BaseModelTest couvre un modèle NON lié à un
établissement (l'utilisateur est global au système) :
    - les tests "établissement" sont automatiquement skippés
    - le vrai UserService est utilisé (service_class)
    - la query GraphQL réelle 'users' est activée (gql_query)
"""
from apps.core.tests.base import BaseModelTest
from apps.profilmanagement.models import User
from apps.profilmanagement.services.user_service import UserService


class TestUserContract(BaseModelTest):
    model = User
    service_class = UserService
    gql_query = "users"
    gql_response_key = "users"

    def payload(self, establishment, index=""):
        return {
            "username": f"user{index}",
            "email": f"user{index}@example.com",
            "first_name": "Test",
        }
