from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.core.services.BaseService import BaseService
from ..models import Personnel

class PersonnelService(BaseService):
    model = Personnel

    def after_save(self, instance, created):
        # 1. Capture nested user data from initial request (as it's read_only in serializer)
        initial_data = getattr(self, 'initial_data', {}) or {}
        user_source = initial_data.get('user') if isinstance(initial_data, dict) else None
        email_pro = instance.email_pro
        
        user = None

        # If 'user' is a dictionary (nested write via Serializer)
        if isinstance(user_source, dict):
            email = user_source.get('email') or email_pro
            first_name = user_source.get('first_name', '')
            last_name = user_source.get('last_name', '')
            
            if email:
                User = get_user_model()
                user = User.objects.filter(email=email).first()
                
                if user:
                    # Update existing user details
                    updated = False
                    if first_name and user.first_name != first_name:
                        user.first_name = first_name
                        updated = True
                    if last_name and user.last_name != last_name:
                        user.last_name = last_name
                        updated = True
                    if updated:
                        user.save()
                else:
                    # Create new user
                    # Generate username from first.last
                    from django.utils.text import slugify
                    
                    base = f"{first_name}.{last_name}"
                    if not first_name and not last_name:
                         base = email.split('@')[0]
                    
                    base_username = slugify(base)
                    
                    username = base_username
                    counter = 1
                    while User.objects.filter(username=username).exists():
                        username = f"{base_username}{counter}"
                        counter += 1
                        
                    user = User.objects.create_user(
                        username=username,
                        email=email,
                        password="ChangeMe123!",
                        first_name=first_name,
                        last_name=last_name
                    )

        # If 'user' not provided but 'email_pro' exists (Auto-create simple)
        elif not user_source and not instance.user and email_pro:
            User = get_user_model()
            user = User.objects.filter(email=email_pro).first()
            if not user:
                # Use email prefix for pro email fallback as likely no names provided here?
                # Actually, instance might have names if they were set on Personnel model directly?
                # But typically names are in user dict. If only email_pro is set, we lack names.
                # So keep email split for this fallback case.
                username = email_pro.split('@')[0]
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1
                user = User.objects.create_user(username=username, email=email_pro, password="ChangeMe123!")
            
        # Update link if we found/created a user
        if user:
            if instance.user != user:
                instance.user = user
                instance.save(update_fields=['user'])

            # Sync or create the establishment membership for this user
            self._sync_establishment_membership(instance, user)
            
            # Sync Phone
            if instance.phone_number and instance.phone_number != user.phone:
                user.phone = instance.phone_number
                user.save(update_fields=['phone'])

    def _sync_establishment_membership(self, instance, user):
        """
        Crée ou met à jour le membership établissement lié au Personnel.
        """
        if not instance.establishment or not user:
            return

        from apps.core.services.establishment_membership_service import EstablishmentMembershipService

        membership_service = EstablishmentMembershipService()
        membership, created = membership_service.get_or_create(
            user=user,
            establishment=instance.establishment,
            defaults={
                'is_owner': False,
                'status': 'active',
                'created_by_user': getattr(self, 'user', None),
                'updated_by_user': getattr(self, 'user', None),
            }
        )
        membership_service.sync_roles_from_personnel(membership, instance)
