import os
from django.utils.text import slugify

def get_file_category(extension):
    """
    Returns the category folder name based on file extension.
    """
    extension = extension.lower()
    if extension in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff']:
        return 'image' # Singular 'image' as requested
    elif extension in ['.pdf', '.xls', '.xlsx', '.doc', '.docx', '.ppt', '.pptx', '.csv', '.txt']:
        return 'pdfexcel'
    return 'others'

def document_upload_path(instance, filename):
    """
    Generates dynamic upload path:
    1. Custom path if model defines 'get_document_upload_path'
    2. Default: <app_label>/<category>/<filename>
    
    Handles both Document instances (via content_object) and direct Model instances (like User).
    """
    name, ext = os.path.splitext(filename)
    safe_name = slugify(name)
    final_filename = f"{safe_name}{ext.lower()}"
    category = get_file_category(ext)
    
    # CASE 1: Instance is a generic Document linking to another object
    if hasattr(instance, 'content_object') and instance.content_object:
        # Allow the related object to override path generation
        if hasattr(instance.content_object, 'get_document_upload_path'):
            return instance.content_object.get_document_upload_path(filename, category)
        
        app_label = instance.content_type.app_label
        return f"{app_label}/{category}/{final_filename}"
    
    # CASE 2: Instance is a direct model (e.g., User, Personnel)
    # We can detect app_label from the instance's meta
    if hasattr(instance, '_meta'):
        app_label = instance._meta.app_label
        return f"{app_label}/{category}/{final_filename}"

    # Fallback
    return f"common/{category}/{final_filename}"
