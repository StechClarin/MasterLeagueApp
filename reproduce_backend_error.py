import os
import sys
import django
import traceback

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

print("--- Testing EcoleController Instantiation ---")
try:
    from apps.profilmanagement.api.controllers.ecole_controller import EcoleController
    print("Import successful.")
    
    # Simulate instantiation (DRF views are instantiated per request, but __init__ runs)
    controller = EcoleController()
    print("Instantiation successful.")
    
    print("Service instance:", controller.service)
    print("Serializer class:", controller.serializer)

except Exception:
    traceback.print_exc()

print("\n--- Testing EcoleService Instantiation ---")
try:
    from apps.profilmanagement.services.ecole_service import EcoleService
    service = EcoleService()
    print("EcoleService instantiation successful.")
except Exception:
    traceback.print_exc()
