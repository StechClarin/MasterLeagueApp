from django.core.exceptions import ValidationError
from apps.core.services.BaseService import BaseService
from ..models.asset import Asset

class AssetService(BaseService):
    model = Asset

    def before_save(self, data, instance=None):
        data = super().before_save(data, instance)

        serial_number = data.get('serial_number')
        name = data.get('name')

        if instance:
            if serial_number is None: serial_number = instance.serial_number
            if name is None: name = instance.name

        est_id = data.get('establishment_id') or data.get('establishment')
        if not est_id and instance:
            est_id = instance.establishment_id

        # Validation de l'unicité du nom de l'équipement dans l'établissement
        if name:
            self.validate_uniqueness(
                establishment_id=est_id,
                instance=instance,
                field_name='name',
                message=f"Un équipement nommé '{name}' existe déjà.",
                name=name
            )

        # Validation de l'unicité du numéro de série dans l'établissement (s'il est renseigné)
        if serial_number:
            self.validate_uniqueness(
                establishment_id=est_id,
                instance=instance,
                field_name='serial_number',
                message=f"Le numéro de série / code-barres '{serial_number}' est déjà attribué à un autre équipement.",
                serial_number=serial_number
            )

        return data

    def report_issue(self, pk, description):
        """ Déclare une panne et change le statut en EN_PANNE """
        asset = self.get_by_id(pk)
        from ..models.intervention_request import InterventionRequest
        
        intervention = InterventionRequest.objects.create(
            asset=asset,
            description=description,
            establishment_id=asset.establishment_id
        )
        
        asset.status = 'EN_PANNE'
        asset.save(update_fields=['status'])
        return asset

    def perform_maintenance(self, pk, description):
        """ Enregistre un rapport de maintenance et remet le statut à DISPONIBLE """
        asset = self.get_by_id(pk)
        from ..models.maintenance_record import MaintenanceRecord
        
        record = MaintenanceRecord.objects.create(
            asset=asset,
            description=description,
            establishment_id=asset.establishment_id
        )
        
        asset.status = 'DISPONIBLE'
        asset.save(update_fields=['status'])
        return record

    def assign(self, pk, room_id):
        """ Assigne le matériel à un local et change le statut en AFFECTE """
        asset = self.get_by_id(pk)
        from apps.structure.models.room import Room
        
        try:
            room = Room.objects.get(pk=room_id)
        except Room.DoesNotExist:
            raise ValueError("Le local d'affectation spécifié est introuvable.")

        asset.room = room
        asset.status = 'AFFECTE'
        asset.save(update_fields=['room', 'status'])
        return asset

    def unassign(self, pk):
        """ Désaffecte le matériel et le remet à DISPONIBLE """
        asset = self.get_by_id(pk)
        asset.room = None
        asset.status = 'DISPONIBLE'
        asset.save(update_fields=['room', 'status'])
        return asset

    def retire(self, pk):
        """ Décrasse/met au rebut le matériel """
        asset = self.get_by_id(pk)
        asset.status = 'REBUT'
        asset.save(update_fields=['status'])
        return asset

    def check_maintenance_alerts(self, user):
        """Vérifie les échéances de maintenance et crée les notifications polymorphiques.
        Retourne le nombre de notifications créées."""
        if not user or user.is_anonymous:
            return 0

        import datetime
        from apps.core.models.notification import Notification
        from django.contrib.contenttypes.models import ContentType

        created_count = 0

        # On recherche les matériels actifs
        assets = self.model.objects.filter(maintenance_frequency__gt=0).exclude(status='REBUT')
        asset_ct = ContentType.objects.get_for_model(self.model)
        today = datetime.date.today()

        for asset in assets:
            next_date = asset.next_maintenance_date
            if not next_date:
                continue

            days_remaining = (next_date - today).days
            if days_remaining <= asset.notification_threshold_days:
                title = f"Échéance de maintenance - {asset.name}"
                exists = Notification.objects.filter(
                    recipient=user,
                    title=title,
                    is_read=False,
                    content_type=asset_ct,
                    object_id=asset.id
                ).exists()

                if not exists:
                    msg = f"La prochaine maintenance théorique de l'équipement '{asset.name}' est prévue le {next_date.strftime('%d/%m/%Y')} (dans {days_remaining} jours)."
                    if days_remaining < 0:
                        msg = f"La maintenance de l'équipement '{asset.name}' est en retard de {abs(days_remaining)} jours (prévue le {next_date.strftime('%d/%m/%Y')})."
                    elif days_remaining == 0:
                        msg = f"La maintenance de l'équipement '{asset.name}' est à effectuer aujourd'hui."

                    Notification.objects.create(
                        recipient=user,
                        title=title,
                        message=msg,
                        content_type=asset_ct,
                        object_id=asset.id,
                        is_read=False
                    )
                    created_count += 1

        return created_count
