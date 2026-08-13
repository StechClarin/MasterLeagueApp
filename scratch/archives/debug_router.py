import os
import django
from django.apps import apps
from django.utils.module_loading import import_module

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def get_app_name_from_model(model_name):
    print(f"Scanning for model '{model_name}'...")
    for app_config in apps.get_app_configs():
        # On ne scanne que nos apps locales pour gagner du temps
        if not app_config.name.startswith('apps.'):
            continue
            
        try:
            print(f"Checking app: {app_config.name} ({app_config.label})")
            # C'est la méthode officielle Django pour voir si un modèle existe dans une app
            model = app_config.get_model(model_name)
            print(f"FOUND! Model {model_name} found in {app_config.label}")
            return app_config.label # Retourne 'profilmanagement' par exemple
        except LookupError:
            continue
    print("NOT FOUND in any local app.")
    return None

def get_controller_class(model_name):
    print(f"\n--- Resolving Controller for '{model_name}' ---")
    app_label = get_app_name_from_model(model_name)
    if not app_label:
        print(f"ERROR: No app found for model '{model_name}'")
        return
    
    module_path = f'apps.{app_label}.api.controllers.{model_name.lower()}_controller'
    print(f"Attempting to import module: {module_path}")
    
    try:
        module = import_module(module_path)
        print("Module imported successfully.")
    except Exception as e:
        print(f"ERROR importing module: {e}")
        return

    class_name = f'{model_name.capitalize()}Controller'
    print(f"Looking for class: {class_name}")
    
    try:
        controller_class = getattr(module, class_name)
        print(f"SUCCESS: Found class {controller_class}")
        
        # Instantiate and check method
        instance = controller_class()
        if hasattr(instance, 'export_data'):
            print("SUCCESS: Method 'export_data' found on instance.")
        else:
            print("ERROR: Method 'export_data' NOT found on instance.")
            
        return controller_class
    except AttributeError:
        print(f"ERROR: Class {class_name} not found in module.")

print("Debugging 'user'...")
get_controller_class('user')
