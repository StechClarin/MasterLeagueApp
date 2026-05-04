import os
import django
from uuid import UUID

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.hr.services.personnel_service import PersonnelService
from apps.profilmanagement.models.role import Role
from apps.core.models.establishment import Establishment
from django.contrib.auth import get_user_model
from apps.hr.models import Personnel

def seed_personnel():
    est_id = "2bebda75-8a78-44b8-9e2e-ebcd3bb2e118" # Saphir
    establishment = Establishment.objects.get(id=est_id)
    User = get_user_model()
    
    # Mapping roles name -> ID
    roles_map = {
        'DIRECTEUR_ETABLISSEMENT': '67f137ba-e25e-42ff-9dd0-d5efb43f4043',
        'DIRECTEUR_ETUDES': 'b7f66abb-840b-4076-9fc6-9a7b7cb3a197',
        'RESPONSABLE_RH': '2201bd01-0b5b-4223-b704-269273d3bfa4',
        'SURVEILLANT': '3214037a-3af2-4025-9f81-5042c3fd6645',
        'ENSEIGNANT': '4259dfde-f940-4c88-860e-e00e21b9efe4',
        'COMPTABLE': 'b6c72458-1c5f-432b-b0da-8f72015d0b12',
    }

    personnel_data = [
        {"first": "Alain", "last": "Nguema", "role": "DIRECTEUR_ETABLISSEMENT", "job": "Directeur Général", "gender": "M"},
        {"first": "Beatrice", "last": "Zogo", "role": "DIRECTEUR_ETUDES", "job": "Censeur Principal", "gender": "F"},
        {"first": "Charles", "last": "Mba", "role": "RESPONSABLE_RH", "job": "Gestionnaire RH", "gender": "M"},
        {"first": "David", "last": "Ndong", "role": "SURVEILLANT", "job": "Surveillant Général", "gender": "M"},
        {"first": "Estelle", "last": "Biyogo", "role": "SURVEILLANT", "job": "Surveillante Adjointe", "gender": "F"},
        {"first": "Franck", "last": "Obame", "role": "COMPTABLE", "job": "Comptable Senior", "gender": "M"},
        {"first": "Gisele", "last": "Assoumou", "role": "COMPTABLE", "job": "Aide Comptable", "gender": "F"},
        {"first": "Herve", "last": "Mintsa", "role": "ENSEIGNANT", "job": "Professeur Mathématiques", "gender": "M"},
        {"first": "Irene", "last": "Mekui", "role": "ENSEIGNANT", "job": "Professeur Français", "gender": "F"},
        {"first": "Justin", "last": "Eman", "role": "ENSEIGNANT", "job": "Professeur Histoire", "gender": "M"},
    ]

    for p in personnel_data:
        role_id = roles_map[p['role']]
        email = f"{p['first'].lower()}.{p['last'].lower()}@saphir.com"
        
        print(f"Processing {p['first']} {p['last']}...")
        
        # 1. Création/Récupération de l'utilisateur
        username = f"{p['first'].lower()}.{p['last'].lower()}"
        user = User.objects.filter(email=email).first()
        if not user:
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=p['first'],
                last_name=p['last'],
                password='ChangeMe123!'
            )
        
        # 2. Check existing Personnel
        personnel_instance = Personnel.objects.filter(user=user, establishment=establishment).first()

        data = {
            'user': user,
            'gender': p['gender'],
            'job_title': p['job'],
            'email_pro': email,
            'establishment': establishment,
            'roles': [role_id]
        }
        
        try:
            service = PersonnelService()
            service.set_context(user=None, establishment_id=est_id)
            
            data = service.before_validate(data, instance=personnel_instance)
            obj = service.save(data, instance=personnel_instance)
            print(f"Success: {obj.matricule} (Created: {personnel_instance is None})")
        except Exception as e:
            print(f"Error processing {p['first']}: {str(e)}")

if __name__ == "__main__":
    seed_personnel()
