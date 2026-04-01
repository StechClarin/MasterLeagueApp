from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

class PingView(APIView):
    """
    Simple endpoint for the Hub to check if the application is ready.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        return JsonResponse({"status": "ready", "message": "Ethernanos App is alive"}, status=200)
