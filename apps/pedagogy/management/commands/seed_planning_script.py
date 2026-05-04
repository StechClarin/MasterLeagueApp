import os
import django
from datetime import date, timedelta, time
from uuid import UUID

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.pedagogy.services.planning_service import PlanningService
from apps.structure.models.classroom import ClassRoom
from apps.structure.models.subject import Subject
from apps.structure.models.room import Room
from apps.hr.models.personnel import Personnel
from apps.core.models.establishment import Establishment

def seed_planning():
    est_id = "2bebda75-8a78-44b8-9e2e-ebcd3bb2e118" # Saphir
    establishment = Establishment.objects.get(id=est_id)
    
    # 1. Create more subjects if needed
    subject_names = [
        ('Français', 'FRAN'), 
        ('Histoire-Géo', 'HISTGEO'), 
        ('Anglais', 'ANGL'), 
        ('SVT', 'SVT'), 
        ('Philosophie', 'PHILO'),
        ('Mathématiques', 'MATH'),
        ('Science physique', 'SP')
    ]
    for name, code in subject_names:
        Subject.objects.get_or_create(code=code, establishment=establishment, defaults={'name': name})
    
    # 2. Create rooms
    room_names = ['Salle 101', 'Salle 102', 'Salle 103', 'Laboratoire', 'Bibliothèque']
    for name in room_names:
        Room.objects.get_or_create(name=name, establishment=establishment, defaults={'capacity': 30})
    
    # 3. Get all required data
    classrooms = list(ClassRoom.objects.filter(establishment=establishment))
    subjects = list(Subject.objects.filter(establishment=establishment))
    teachers = list(Personnel.objects.filter(establishment=establishment, roles__name='ENSEIGNANT'))
    rooms = list(Room.objects.filter(establishment=establishment))
    
    if not teachers:
        print("Error: No teachers found for Saphir")
        return

    # 4. Create Planning object
    start_date = date(2026, 4, 27) # Next Monday
    end_date = start_date + timedelta(days=20) # 3 weeks (21 days total)
    
    planning_data = {
        'nom': "Planning Pédagogique - Mai 2026",
        'date_start': start_date.isoformat(),
        'date_end': end_date.isoformat(),
        'establishment': establishment, # Pass instance
        'details': []
    }
    
    # 5. Generate Details
    target_classes = [c for c in classrooms if c.name in ['Terminal D', '3eme', '6eme']]
    if not target_classes:
        target_classes = classrooms[:3]
        
    slots = [
        (time(8, 0), time(10, 0)),
        (time(10, 15), time(12, 15)),
        (time(13, 30), time(15, 30)),
    ]
    
    for i in range(21):
        current_date = start_date + timedelta(days=i)
        if current_date.weekday() >= 5:
            continue
            
        for classroom in target_classes:
            for j, (start_time, end_time) in enumerate(slots):
                idx = (i + j + target_classes.index(classroom))
                subject = subjects[idx % len(subjects)]
                teacher = teachers[idx % len(teachers)]
                room = rooms[idx % len(rooms)]
                
                detail = {
                    'classe_id': str(classroom.id),
                    'matiere_id': str(subject.id),
                    'enseignant_id': str(teacher.id),
                    'salle_id': str(room.id),
                    'date': current_date.isoformat(),
                    'heure_debut': start_time.strftime('%H:%M'),
                    'heure_fin': end_time.strftime('%H:%M'),
                }
                planning_data['details'].append(detail)
    
    # 6. Save via Service
    service = PlanningService()
    service.set_context(user=None, establishment_id=est_id)
    
    print(f"Creating planning with {len(planning_data['details'])} lessons...")
    try:
        cleaned_data = service.before_validate(planning_data)
        planning_obj = service.save(cleaned_data)
        print(f"Planning created: {planning_obj.nom} (ID: {planning_obj.id})")
    except Exception as e:
        print(f"Error creating planning: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    seed_planning()
