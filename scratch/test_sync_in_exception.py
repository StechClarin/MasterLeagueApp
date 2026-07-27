import os
import django
import sys
import traceback

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.core.api.views.sync import SyncInView
from rest_framework.test import APIRequestFactory

factory = APIRequestFactory()
view = SyncInView.as_view()

# Test request payload
payload = {
    "admin": {
        "id": "00000000-0000-0000-0000-000000000000",
        "username": "admin_test",
        "email": "admin_test@test.com",
        "first_name": "Test",
        "last_name": "Admin",
        "password_hash": "pbkdf2_sha256$260000$xxxx$yyyy",
        "is_staff": True,
        "is_active": True
    },
    "establishments": [
        {
            "id": "11111111-1111-1111-1111-111111111111",
            "name": "Test School",
            "code": "ETH-NANOS-GRHRYU",
            "related_elements": {}
        }
    ],
    "unlocked_module_codes": ["mod-students", "mod-students", "mod-finance"]
}

request = factory.post('/api/external/sync-in/', payload, format='json')
request.META['HTTP_X_HUB_API_KEY'] = 'ethernanos-hub-secret-2026'

print("--- Running simulated SyncInView request ---")
try:
    response = view(request)
    print("Response status:", response.status_code)
    print("Response data:", response.data)
except Exception as e:
    print("CRITICAL EXCEPTION RAISED:")
    traceback.print_exc()
