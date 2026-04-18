# apps/core/services/establishment_membership_service.py
from apps.core.services.BaseService import BaseService
from ..models.establishment_membership import EstablishmentMembership

class EstablishmentMembershipService(BaseService):
    model = EstablishmentMembership

    def create_or_update_with_roles(self, user, establishment, roles=None, is_owner=None, status='active'):
        """
        Crée ou met à jour un membership avec gestion explicite des rôles et de la règle Hub.
        """
        # Règle Hub : is_owner est forcé si l'utilisateur possède un hub_id
        effective_owner = is_owner
        if hasattr(user, 'hub_id') and user.hub_id:
            effective_owner = True

        membership, created = self.get_or_create(
            user=user,
            establishment=establishment,
            defaults={
                'is_owner': effective_owner if effective_owner is not None else False,
                'status': status
            }
        )

        if not created and effective_owner is not None:
            membership.is_owner = effective_owner
            membership.status = status
            membership.save()

        if roles:
            membership.roles.set(roles)

        return membership, created

    def get_or_create(self, user, establishment, defaults=None):
        """
        Récupère ou crée un membership pour un utilisateur et un établissement.
        """
        return EstablishmentMembership.objects.get_or_create(
            user=user,
            establishment=establishment,
            defaults=defaults or {}
        )

    def sync_roles_from_personnel(self, membership, personnel_instance):
        """
        Synchronise les rôles définis dans la fiche Personnel vers le Membership.
        """
        if not membership or not personnel_instance:
            return

        roles = personnel_instance.roles.all()
        if roles.exists():
            membership.roles.set(roles)
        
        # Synchronisation du statut (Savoir si l'employé peut toujours se connecter)
        new_status = 'active' if personnel_instance.is_active else 'inactive'
        if membership.status != new_status:
            membership.status = new_status
            membership.save(update_fields=['status'])
