from django.core.management.base import BaseCommand
from apps.hr.models import ContractType

class Command(BaseCommand):
    help = 'Seed database with initial data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding data...')
        
        self.seed_contract_types()
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded data'))

    def seed_contract_types(self):
        contract_types = [
            {
                'code': 'CDI',
                'designation': 'Contrat à Durée Indéterminée',
                'description': 'Contrat de travail sans limitation de durée.'
            },
            {
                'code': 'CDD',
                'designation': 'Contrat à Durée Déterminée',
                'description': 'Contrat de travail pour une durée limitée.'
            },
            {
                'code': 'STAGE',
                'designation': 'Stage',
                'description': 'Convention de stage.'
            },
            {
                'code': 'ALTERNANCE',
                'designation': 'Alternance',
                'description': 'Contrat en alternance (apprentissage ou professionnalisation).'
            },
            {
                'code': 'INTERIM',
                'designation': 'Intérim',
                'description': 'Contrat de travail temporaire.'
            },
            {
                'code': 'FREELANCE',
                'designation': 'Freelance',
                'description': 'Prestataire indépendant.'
            }
        ]

        created_count = 0
        for data in contract_types:
            obj, created = ContractType.objects.get_or_create(
                code=data['code'],
                defaults={
                    'designation': data['designation'],
                    'description': data['description']
                }
            )
            if created:
                created_count += 1
        
        self.stdout.write(f'- ContractTypes: {created_count} created')
