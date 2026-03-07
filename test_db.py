import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.evaluations.models import EvaluationSession, EvaluationPlanning, EvaluationSupervision

session = EvaluationSession.objects.last()
if not session:
    print("No sessions found.")
else:
    print(f"Session: {session.title} (ID: {session.id})")
    
    plannings = EvaluationPlanning.objects.filter(evaluation_subject__session=session)
    print(f"Plannings count: {plannings.count()}")
    for p in plannings:
        print(f" - {p.date} | Start: {p.start_time} | Duration: {p.duration_minutes} | Classrooms: {[c.name for c in p.classrooms.all()]}")
        
    supervisions = EvaluationSupervision.objects.filter(session=session)
    print(f"Supervisions count: {supervisions.count()}")
    for s in supervisions:
        print(f" - {s.date} | Classroom: {s.classroom.name if s.classroom else None} | Supervisors: {[u.username for u in s.supervisors.all()]}")

