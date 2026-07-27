import os
import hashlib
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.http import FileResponse, Http404
from django.utils.text import slugify

class AssetManifestView(APIView):
    """
    Expose a manifest of all media files for a specific tenant.
    Used by the Hub to identify missing local files.
    """
    authentication_classes = []
    permission_classes = []

    def get(self, request, *args, **kwargs):
        api_key = request.headers.get('X-Hub-Api-Key')
        expected_key = os.environ.get('HUB_API_KEY', 'ethernanos-hub-secret-2026')
        
        if not api_key or api_key != expected_key:
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
            
        tenant_id = request.query_params.get('tenant_id')
        if not tenant_id:
            return Response({"error": "Missing tenant_id"}, status=status.HTTP_400_BAD_REQUEST)

        from apps.core.models import Establishment
        from apps.documents.models import Document
        from django.contrib.contenttypes.models import ContentType
        from django.apps import apps

        try:
            est = Establishment.objects.filter(code=tenant_id).first()
            if not est:
                from apps.profilmanagement.models import User
                user = User.objects.filter(hub_id=tenant_id).first()
                if user:
                    est = Establishment.objects.filter(user=user).first()
            
            if not est:
                raise Establishment.DoesNotExist()
        except Establishment.DoesNotExist:
            return Response({"error": "Tenant not found"}, status=status.HTTP_404_NOT_FOUND)

        # 1. Collect files from Polymorphic Documents
        documents = Document.objects.filter(establishment=est)
        file_paths = set()
        for doc in documents:
            if doc.file:
                file_paths.add(doc.file.name)

        # 1b. Collect files from Establishment itself
        if est.logo and est.logo.name:
            file_paths.add(est.logo.name)
        if est.print_header and est.print_header.name:
            file_paths.add(est.print_header.name)
            
        # 1c. Collect files from Users associated with this establishment
        from apps.core.models.establishment_membership import EstablishmentMembership
        memberships = EstablishmentMembership.objects.filter(establishment=est).select_related('user')
        for member in memberships:
            if member.user and member.user.photo and member.user.photo.name:
                file_paths.add(member.user.photo.name)

        # 2. Collect files from Direct Models (like Student.photo)
        # We look for models that have FileField/ImageField and are EstablishmentAware
        from apps.core.models.establishment_aware_model import EstablishmentAwareModel
        from django.db.models import FileField

        for model in apps.get_models():
            if issubclass(model, EstablishmentAwareModel) and model != EstablishmentAwareModel:
                file_fields = [f.name for f in model._meta.fields if isinstance(f, FileField)]
                if file_fields:
                    # Query records for this establishment
                    qs = model.objects.filter(establishment=est)
                    for record in qs:
                        for field in file_fields:
                            val = getattr(record, field)
                            if val and hasattr(val, 'name') and val.name:
                                file_paths.add(val.name)

        # 3. Build manifest with hashes
        manifest = []
        media_root = settings.MEDIA_ROOT
        
        for relative_path in file_paths:
            full_path = os.path.join(media_root, relative_path)
            if os.path.exists(full_path):
                # Calculate MD5 hash
                hasher = hashlib.md5()
                with open(full_path, 'rb') as f:
                    for chunk in iter(lambda: f.read(4096), b""):
                        hasher.update(chunk)
                
                manifest.append({
                    "path": relative_path,
                    "hash": hasher.hexdigest(),
                    "size": os.path.getsize(full_path)
                })

        return Response({"manifest": manifest}, status=status.HTTP_200_OK)

class AssetTransferView(APIView):
    """
    Handles binary transfer (download/upload) of media files.
    """
    authentication_classes = []
    permission_classes = []

    def get(self, request, *args, **kwargs):
        """ Download a file from VPS/Cloud """
        api_key = request.headers.get('X-Hub-Api-Key')
        if api_key != os.environ.get('HUB_API_KEY', 'ethernanos-hub-secret-2026'):
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        file_path = request.query_params.get('path')
        if not file_path:
            return Response({"error": "Missing file path"}, status=status.HTTP_400_BAD_REQUEST)

        # Safety check: prevent path traversal
        absolute_path = os.path.abspath(os.path.join(settings.MEDIA_ROOT, file_path))
        if not absolute_path.startswith(os.path.abspath(settings.MEDIA_ROOT)):
            return Response({"error": "Invalid path"}, status=status.HTTP_403_FORBIDDEN)

        if not os.path.exists(absolute_path):
            raise Http404("File not found")

        return FileResponse(open(absolute_path, 'rb'))

    def post(self, request, *args, **kwargs):
        """ Upload a file to VPS/Cloud """
        api_key = request.headers.get('X-Hub-Api-Key')
        if api_key != os.environ.get('HUB_API_KEY', 'ethernanos-hub-secret-2026'):
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        file_obj = request.FILES.get('file')
        target_path = request.data.get('path') # Path relative to MEDIA_ROOT

        if not file_obj or not target_path:
            return Response({"error": "Missing file or path"}, status=status.HTTP_400_BAD_REQUEST)

        # Safety check: prevent path traversal
        absolute_path = os.path.abspath(os.path.join(settings.MEDIA_ROOT, target_path))
        if not absolute_path.startswith(os.path.abspath(settings.MEDIA_ROOT)):
            return Response({"error": "Invalid path"}, status=status.HTTP_403_FORBIDDEN)

        # Ensure directory exists
        os.makedirs(os.path.dirname(absolute_path), exist_ok=True)

        with open(absolute_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)

        return Response({"status": "File uploaded successfully", "path": target_path}, status=status.HTTP_201_CREATED)
