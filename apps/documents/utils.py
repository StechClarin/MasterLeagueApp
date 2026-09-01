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
    est = None
    if hasattr(obj, 'establishment') and obj.establishment:
        est = obj.establishment
        est_id = str(est.id)
    elif hasattr(obj, 'user') and obj.user and hasattr(obj.user, 'hub_id'):
        # Si l'objet métier est l'Etablissement lui-même
        est = obj
        est_id = str(getattr(obj, 'id', 'global'))
    elif hasattr(obj, 'hub_id'):
        # Si l'objet métier est l'Utilisateur
        hub_id = obj.hub_id or "global"
    
    # CRITIQUE SYNC ASSETS : le hub_id détermine le dossier racine des médias.
    # Pour que les chemins soient IDENTIQUES entre Cloud et Local, on privilégie
    # `user.hub_id` (présent sur le Cloud), puis on se rabat sur `establishment.code`
    # (identique des deux côtés après sync-in) avant le fallback "global".
    # Sans cela, les fichiers locaux partaient sous "global/..." et ne pouvaient
    # jamais être mis en correspondance avec les manifestes du Cloud.
    if est is not None:
        est_user = getattr(est, 'user', None)
        hub_id = (getattr(est_user, 'hub_id', None) or "") or (getattr(est, 'code', None) or "") or "global"
    
    return f"{hub_id}/{est_id}/{category}/{final_filename}"
