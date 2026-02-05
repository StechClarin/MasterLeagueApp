
import importlib
import re
from django.apps import apps

print("--- Simulating System Check ---")

for model in apps.get_models():
    if model._meta.app_label != 'hr':
        continue
    
    # Logic from apps/core/checks.py
    app_label = model._meta.app_label
    model_name = model.__name__
    app_config = apps.get_app_config(app_label)
    
    print(f"Checking Model: {model_name} (App: {app_config.name})")

    snake_name = re.sub(r'(?<!^)(?=[A-Z])', '_', model_name).lower()
    
    controller_module_path = f"{app_config.name}.api.controllers.{snake_name}_controller"
    controller_class_name = f"{model_name}Controller"
    
    print(f"  Target Path: {controller_module_path}")
    print(f"  Target Class: {controller_class_name}")

    try:
        module = importlib.import_module(controller_module_path)
        print("  [OK] Module imported.")
        if not hasattr(module, controller_class_name):
             print(f"  [FAIL] Class {controller_class_name} missing.")
        else:
             print("  [OK] Class found.")
             
    except ImportError as e:
        print(f"  [FAIL] ImportError: {e}")
    except Exception as e:
        print(f"  [FAIL] Exception: {e}")
