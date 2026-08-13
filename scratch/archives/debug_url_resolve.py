import os
import django
from django.urls import resolve, Resolver404

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

url_to_test = "/api/user/export_data/"

print(f"Resolving URL: {url_to_test}")
try:
    match = resolve(url_to_test)
    print(f"Match found!")
    print(f"View Name: {match.view_name}")
    print(f"View Func: {match.func}")
    print(f"Args: {match.args}")
    print(f"Kwargs: {match.kwargs}")
    
    # Check if it maps to RouterView
    from apps.core.api.controllers.RouterController import RouterView
    if match.func.view_class == RouterView:
        print("CONFIRMED: Maps to RouterView")
    else:
        print(f"WARNING: Maps to {match.func.view_class}")

except Resolver404:
    print("ERROR: URL did not match any pattern.")
except Exception as e:
    print(f"ERROR: {e}")
