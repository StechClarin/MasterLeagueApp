import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.hr.models.contract_type import ContractType
from django.db.models import Count

def remove_duplicates():
    print("Checking for duplicate ContractType designations...")
    duplicates = ContractType.objects.values('designation').annotate(count=Count('id')).filter(count__gt=1)
    
    for entry in duplicates:
        designation = entry['designation']
        print(f"Found duplicate: {designation}")
        types = ContractType.objects.filter(designation=designation).order_by('id')
        
        # Keep the first one, delete the rest
        keep = types.first()
        to_delete = types[1:]
        
        print(f"Keeping ID {keep.id}, deleting {len(to_delete)} others.")
        for item in to_delete:
            item.delete()

    print("Duplicates removed.")

if __name__ == "__main__":
    remove_duplicates()
