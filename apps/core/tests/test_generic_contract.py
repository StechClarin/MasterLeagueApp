"""
PREUVE DE CONCEPT du socle générique (BaseModelTest) sur un modèle réel : Module.

Ce fichier montre le pattern minimal pour tester N'IMPORTE QUEL modèle :
    1. hériter de BaseModelTest
    2. définir model
    3. définir payload()

Tout le reste (création, isolation tenant, update, delete, API, GraphQL)
est fourni automatiquement par le socle.
"""
from apps.core.models import Module
from apps.core.tests.base import BaseModelTest


class TestModuleContract(BaseModelTest):
    model = Module

    def payload(self, establishment, index=""):
        return {
            "name": f"Module{index}",
            "code": f"mod-test{index}",
            "order": 1,
            "display_mod": "list-view",
            "icon": "test-icon",
        }
