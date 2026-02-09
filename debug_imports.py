import os
import django
import sys

# Setup Django environment
sys.path.append('/home/stechclarin/Personnel/project_init_django_Angular')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

print("--- Attempting to import PlanningController ---")
try:
    from apps.pedagogy.api.controllers.planning_controller import PlanningController
    print("SUCCESS: PlanningController imported")
except Exception as e:
    print(f"FAILURE: {e}")
    import traceback
    traceback.print_exc()

print("\n--- Attempting to import PlanningDetailController ---")
try:
    from apps.pedagogy.api.controllers.planning_detail_controller import PlanningDetailController
    print("SUCCESS: PlanningDetailController imported")
except Exception as e:
    print(f"FAILURE: {e}")
    import traceback
    traceback.print_exc()

print("\n--- Attempting to import TeachingAssignmentController ---")
try:
    from apps.pedagogy.api.controllers.teaching_assignment_controller import TeachingAssignmentController
    print("SUCCESS: TeachingAssignmentController imported")
except Exception as e:
    print(f"FAILURE: {e}")
    import traceback
    traceback.print_exc()
