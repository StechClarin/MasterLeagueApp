import os
import django
import sys

# Setup Django
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.core.utils.schema_loader import load_all_queries
queries = load_all_queries()
print(f"Found {len(queries)} queries:")
for q in queries:
    print(f" - {q.__name__}")
