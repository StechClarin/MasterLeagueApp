import os
import django
from django.db import connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

tables = [
    'structure_subject', 
    'structure_classroom', 
    'structure_level', 
    'structure_cycle', 
    'structure_academicyear'
]

with connection.cursor() as cursor:
    for table in tables:
        try:
            cursor.execute(f"DROP TABLE IF EXISTS {table} CASCADE;")
            print(f"Dropped {table}")
        except Exception as e:
            print(f"Error dropping {table}: {e}")
