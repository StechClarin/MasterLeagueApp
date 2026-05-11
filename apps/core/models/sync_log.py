import uuid
from django.db import models

class SyncLog(models.Model):
    """
    JOURNAL DE SYNCHRONISATION (SYNC LOG)
    -------------------------------------
    Enregistre chaque modification locale (Delta) pour permettre au Hub
    de "pousser" les données vers le Cloud.
    """
    ACTION_CHOICES = [
        ('CREATE', 'Création'),
        ('UPDATE', 'Modification'),
        ('DELETE', 'Suppression'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    objects = models.Manager()
    
    # Métadonnées de l'objet
    model_name = models.CharField(max_length=100)
    object_uuid = models.UUIDField()
    
    # L'action effectuée
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    
    # Données modifiées (JSON)
    payload = models.JSONField(null=True, blank=True)
    
    # Tracking
    timestamp = models.DateTimeField(auto_now_add=True)
    is_synced = models.BooleanField(default=False, help_text="Vrai si le Hub a déjà poussé cette donnée au Cloud")
    
    class Meta:
        verbose_name = "Log de Synchro"
        verbose_name_plural = "Logs de Synchro"
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.action} on {self.model_name} ({self.object_uuid})"
