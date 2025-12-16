
import os
import django
import sys

sys.path.append('/Applications/XAMPP/xamppfiles/htdocs/project_init_django_Angular')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()
user = User.objects.get(username='ethernanos')
refresh = RefreshToken.for_user(user)
print(f"ACCESS_TOKEN={str(refresh.access_token)}")
