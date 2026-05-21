import os
from django.utils.text import slugify

def get_file_category(extension):
    """
    Returns the category folder name based on file extension.
    """
    extension = extension.lower()
    if extension in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff']:
        return 'image'
    return 'files'

def document_upload_path(instance, filename):
    """
    Generates dynamic upload path: <hub_id>/<establishment_id>/<category>/<filename>
    """
    name, ext = os.path.splitext(filename)
    safe_name = slugify(name)
    final_filename = f"{safe_name}{ext.lower()}"
    category = get_file_category(ext)
    
    hub_id = "global"
    est_id = "global"
    
    # Récupération de l'objet métier de référence
    obj = instance
    if hasattr(instance, 'content_object') and instance.content_object:
        obj = instance.content_object
        
    # Extraction des identifiants (Tenant & Establishment)
    if hasattr(obj, 'establishment') and obj.establishment:
        est_id = str(obj.establishment.id)
        if obj.establishment.user:
            hub_id = obj.establishment.user.hub_id or "global"
    elif hasattr(obj, 'user') and obj.user and hasattr(obj.user, 'hub_id'):
        # Si l'objet métier est l'Etablissement lui-même
        hub_id = obj.user.hub_id or "global"
        est_id = str(getattr(obj, 'id', 'global'))
    elif hasattr(obj, 'hub_id'):
        # Si l'objet métier est l'Utilisateur
        hub_id = obj.hub_id or "global"
        
    return f"{hub_id}/{est_id}/{category}/{final_filename}"
