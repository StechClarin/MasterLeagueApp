import os
import django
from django.core.exceptions import ObjectDoesNotExist

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.profilmanagement.models import User
from rest_framework_simplejwt.tokens import RefreshToken

def get_token():
    try:
        user = User.objects.get(username="ethernanos")
        refresh = RefreshToken.for_user(user)
        print(str(refresh.access_token))
    except ObjectDoesNotExist:
        print("User ethernanos not found")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_token()
