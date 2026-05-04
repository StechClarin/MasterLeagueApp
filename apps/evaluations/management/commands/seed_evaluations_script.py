import os
import django
from uuid import UUID

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.structure.models.level import Level
from apps.structure.models.subject import Subject
from apps.structure.models.level_subject import LevelSubject
from apps.structure.models.academic_period import AcademicPeriod
from apps.evaluations.models.evaluation_type import EvaluationType
from apps.evaluations.models.evaluation import EvaluationSession
from apps.evaluations.models.evaluation_subject import EvaluationSubject
from apps.core.models.establishment import Establishment

def seed_evaluations():
    est_id = "2bebda75-8a78-44b8-9e2e-ebcd3bb2e118" # Saphir
    establishment = Establishment.objects.get(id=est_id)
    
    # 1. Config Quotas (LevelSubject)
    levels = Level.objects.filter(establishment=establishment)
    subjects = Subject.objects.filter(establishment=establishment)
    
    print(f"Configuring quotas for {len(subjects)} subjects across {len(levels)} levels...")
    for level in levels:
        for subject in subjects:
            # Logic for coefficient and quota
            coeff = 2
            quota = 60
            name_low = level.name.lower()
            subj_low = subject.name.lower()
            
            # High school (Lycée)
            if any(x in name_low for x in ['terminal', 'premiere', 'second', 'sencond']):
                coeff = 4
                quota = 100
                if any(x in subj_low for x in ['mathématiques', 'philosophie', 'physique']):
                    coeff = 5
            # Middle school (Collège)
            elif any(x in name_low for x in ['3eme', '4eme', '5eme', '6eme']):
                coeff = 3
                quota = 80
                
            # Update all existing (with or without options)
            updated = LevelSubject.objects.filter(
                level=level, 
                subject=subject, 
                establishment=establishment
            ).update(
                coefficient=coeff,
                hourly_quota=quota
            )
            
            # If none exist, create a default one (without option)
            if updated == 0:
                LevelSubject.objects.create(
                    level=level,
                    subject=subject,
                    establishment=establishment,
                    coefficient=coeff,
                    hourly_quota=quota
                )

    # 2. Create Evaluation Types
    devoir_type, _ = EvaluationType.objects.get_or_create(
        name="Devoir", 
        establishment=establishment,
        defaults={'code': 'DEVOIR', 'weight': 1.0}
    )
    exam_type, _ = EvaluationType.objects.get_or_create(
        name="Examen", 
        establishment=establishment,
        defaults={'code': 'EXAM', 'weight': 2.0}
    )

    # 3. Create Sessions
    period = AcademicPeriod.objects.filter(name__icontains="1er trimestre", establishment=establishment).first()
    if not period:
        period = AcademicPeriod.objects.filter(establishment=establishment).first()
        
    if not period:
        print("Error: No AcademicPeriod found for Saphir")
        return
    
    print(f"Using period: {period.name}")
    
    # Session 1: Devoir départementaux
    session1, created = EvaluationSession.objects.get_or_create(
        title="Devoir départementaux",
        academic_period=period,
        establishment=establishment,
        defaults={
            'scope': 'LEVEL',
            'evaluation_type': devoir_type,
            'status': 'IN_PROGRESS'
        }
    )
    if created:
        print(f"Created Session: {session1.title}")
        core_subjects = subjects.filter(name__in=['Mathématiques', 'Français', 'Anglais', 'Histoire-Géo', 'Science physique'])
        if not core_subjects.exists():
            core_subjects = subjects[:5]
            
        for subject in core_subjects: 
            es = EvaluationSubject.objects.create(
                session=session1,
                subject=subject,
                establishment=establishment,
                max_score=20.0
            )
            es.levels.set(levels)

    # Session 2: Examen
    session2, created = EvaluationSession.objects.get_or_create(
        title="Examen Trimestriel",
        academic_period=period,
        establishment=establishment,
        defaults={
            'scope': 'ESTABLISHMENT',
            'evaluation_type': exam_type,
            'status': 'DRAFT'
        }
    )
    if created:
        print(f"Created Session: {session2.title}")
        for subject in subjects:
            es = EvaluationSubject.objects.create(
                session=session2,
                subject=subject,
                establishment=establishment,
                max_score=20.0
            )
            es.levels.set(levels)
            
    print("Seeding evaluations completed.")

if __name__ == "__main__":
    seed_evaluations()
