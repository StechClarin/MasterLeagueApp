
import os
import django
try:
    print("Attempting to import PersonnelController...")
    from apps.hr.api.controllers.personnel_controller import PersonnelController
    print("SUCCESS: PersonnelController imported.")
except Exception as e:
    print(f"FAILURE: {e}")

try:
    print("Attempting to import ContractTypeController...")
    from apps.hr.api.controllers.contract_type_controller import ContractTypeController
    print("SUCCESS: ContractTypeController imported.")
except Exception as e:
    print(f"FAILURE: {e}")
