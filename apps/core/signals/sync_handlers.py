from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.forms.models import model_to_dict
from apps.core.models.user_audit_model import UserAuditModel
from apps.core.models.sync_log import SyncLog
import json
import uuid

def custom_serializer(obj):
    if isinstance(obj, uuid.UUID):
        return str(obj)
    try:
        if hasattr(obj, 'url'):
            return obj.url
    except ValueError:
        return None
    return str(obj)

@receiver(post_save)
def track_sync_save(sender, instance, created, **kwargs):
    # On ignore le SyncLog lui-même et les modèles sans PK UUID
    if isinstance(instance, SyncLog):
        return
        
    # La base de notre synchro est l'ID UUID (Global Unique)
    if not isinstance(instance.pk, uuid.UUID):
        return

    action = 'CREATE' if created else 'UPDATE'
    
    try:
        # Conversion du modèle en dict pour le JSON
        full_dict = model_to_dict(instance)
        
        # Le model_to_dict ne prend pas les UUID fields correctement parfois, on s'assure de l'ID
        payload_json = json.dumps(full_dict, default=custom_serializer)
        
        SyncLog.objects.create(
            model_name=sender.__name__,
            object_uuid=instance.pk,
            action=action,
            payload=json.loads(payload_json)
        )
    except Exception as e:
        # En prod, on loggerait l'erreur sans bloquer le save principal
        print(f"Error tracking sync for {sender.__name__}: {e}")

@receiver(post_delete)
def track_sync_delete(sender, instance, **kwargs):
    if isinstance(instance, SyncLog) or not isinstance(instance.pk, uuid.UUID):
        return

    try:
        SyncLog.objects.create(
            model_name=sender.__name__,
            object_uuid=instance.pk,
            action='DELETE',
            payload=None
        )
    except Exception as e:
        print(f"Error tracking delete for {sender.__name__}: {e}")
