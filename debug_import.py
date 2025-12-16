
import os
import django
import sys

# Set up Django environment
sys.path.append('/Applications/XAMPP/xamppfiles/htdocs/project_init_django_Angular')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

print("--- Debugging Controller Import ---")
try:
    from apps.structure.api.controllers.academic_year_controller import AcademicYearController
    print("✅ Successfully imported AcademicYearController")
except ImportError as e:
    print(f"❌ Failed to import AcademicYearController: {e}")
except Exception as e:
    print(f"❌ Exception during import: {e}")
