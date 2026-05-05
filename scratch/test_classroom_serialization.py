import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.structure.models.classroom import ClassRoom
from apps.structure.api.serializers.classroom_serializer import ClassRoomSerializer

# On prend la première classe
classroom = ClassRoom.objects.first()
if classroom:
    serializer = ClassRoomSerializer(classroom)
    print(json.dumps(serializer.data, indent=2))
else:
    print("No classroom found")
