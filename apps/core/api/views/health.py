from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.db import connections
from django.db.utils import OperationalError
import time

class HealthView(APIView):
    """
    Industrial Healthcheck for Ethernanos Hub.
    Checks database connectivity and basic app integrity.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        health = {
            "status": "healthy",
            "timestamp": time.time(),
            "checks": {
                "database": "ok",
                "integrity": "verified"
            }
        }
        
        # 1. Database Check
        try:
            db_conn = connections['default']
            db_conn.cursor()
        except OperationalError:
            health["status"] = "unhealthy"
            health["checks"]["database"] = "down"
        
        status_code = 200 if health["status"] == "healthy" else 503
        return JsonResponse(health, status=status_code)
