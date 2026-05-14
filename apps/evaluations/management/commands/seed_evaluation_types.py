from django.core.management.base import BaseCommand
from django.db import models
from apps.evaluations.models import EvaluationType
from apps.core.models import Establishment

EVALUATION_TYPES_CONFIG = [
    {
        "name": "Devoir / CC",
        "code": "CC",
        "weight": 1.0,
        "old_names": ["Devoir", "CC"],
        "description": "Contrôle Continu / Devoir en classe"
    },
    {
        "name": "Examen / Composition",
        "code": "EXAM",
        "weight": 2.0,
        "old_names": ["Composition", "Examen"],
        "description": "Examen de fin de période ou Composition"
    }
]

class Command(BaseCommand):
    help = "Génère les types d'évaluations standards pour tous les établissements."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("--- Début du seeding des Types d'Évaluations ---"))
        
        # On ne sème que pour l'établissement du super-admin
        establishments = Establishment.objects.filter(user__username='ethernanos')
        
        for est in establishments:
            self.stdout.write(f"Traitement de l'établissement : {est.name}")
            for config in EVALUATION_TYPES_CONFIG:
                # On essaie de trouver un type existant par nom ou par code
                eval_type = EvaluationType.objects.filter(
                    establishment=est
                ).filter(
                    models.Q(code=config['code']) | models.Q(name__in=config['old_names'])
                ).first()

                if eval_type:
                    eval_type.name = config['name']
                    eval_type.code = config['code']
                    eval_type.weight = config['weight']
                    eval_type.description = config['description']
                    eval_type.save()
                    self.stdout.write(f"  - Mis à jour : {config['name']} (Code: {config['code']})")
                else:
                    EvaluationType.objects.create(
                        establishment=est,
                        name=config['name'],
                        code=config['code'],
                        weight=config['weight'],
                        description=config['description']
                    )
                    self.stdout.write(self.style.SUCCESS(f"  ✔ Créé : {config['name']} (Code: {config['code']})"))

        self.stdout.write(self.style.SUCCESS("--- Seeding terminé ---"))
