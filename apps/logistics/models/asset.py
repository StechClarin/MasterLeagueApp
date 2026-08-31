from django.db import models
from apps.core.models.establishment_aware_model import EstablishmentAwareModel

class Asset(EstablishmentAwareModel):
    CATEGORY_CHOICES = [
        ('INFORMATIQUE', 'Matériel Informatique'),
        ('MOBILIER', 'Mobilier'),
        ('AUDIOVISUEL', 'Matériel Audiovisuel'),
        ('SPORT', 'Équipement Sportif'),
        ('AUTRE', 'Autre'),
    ]

    STATUS_CHOICES = [
        ('DISPONIBLE', 'Disponible'),
        ('AFFECTE', 'Affecté'),
        ('EN_PANNE', 'En Panne'),
        ('REPARATION', 'En Réparation'),
        ('REBUT', 'Mis au Rebut'),
    ]

    name = models.CharField(max_length=150, verbose_name="Nom de l'équipement")
    serial_number = models.CharField(max_length=100, blank=True, null=True, verbose_name="Numéro de série / Code barre")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='AUTRE', verbose_name="Catégorie")
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='DISPONIBLE', verbose_name="Statut")
    purchase_date = models.DateField(blank=True, null=True, verbose_name="Date d'achat")
    deployment_date = models.DateField(blank=True, null=True, verbose_name="Date de déploiement")
    maintenance_frequency = models.PositiveIntegerField(default=0, verbose_name="Fréquence de maintenance (en jours)")
    notification_threshold_days = models.PositiveIntegerField(default=3, verbose_name="Seuil de notification (jours avant)")
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, verbose_name="Coût d'acquisition")
    room = models.ForeignKey(
        'structure.Room', 
        on_delete=models.SET_NULL, 
        blank=True, 
        null=True, 
        related_name="assets",
        verbose_name="Salle / Local d'affectation"
    )

    class Meta:
        verbose_name = "Équipement / Matériel"
        verbose_name_plural = "Équipements & Matériels"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.get_status_display()})"

    @property
    def next_maintenance_date(self):
        """ Calcule la prochaine date théorique de maintenance """
        if not self.maintenance_frequency:
            return None
            
        last_maintenance = self.maintenances.order_by('-performed_at').first()
        start_date = last_maintenance.performed_at.date() if last_maintenance else (self.deployment_date or self.purchase_date)
        if not start_date:
            return None
            
        import datetime
        return start_date + datetime.timedelta(days=self.maintenance_frequency)
