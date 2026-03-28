from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from apps.core.models import Establishment
from apps.profilmanagement.models import User, Role
from django.db import transaction
from django.core.mail import send_mail
import os

class ProvisionTenantView(APIView):
    """
    BRIDGE "DOUBLE LOCK" - ETHER NANOS HUB
    --------------------------------------
    Cet endpoint est la porte d'entrée de School Manage pour le Hub / Admin Store.
    Il permet d'automatiser (Provisioning) la configuration d'un nouveau client.
    
    Flux :
    1. Validation par Clé API partagée (HUB_API_KEY).
    2. Création/Récupération du Propriétaire (User) - mdp par défaut 'admin1234'.
    3. Création/Mise à jour de l'Établissement (Establishment) rattaché au User.
    4. Link bidirectionnel (User.establishment et Establishment.user).
    """
    authentication_classes = [] # Pas d'auth JWT standard ici
    permission_classes = []     # Filtre manuel par clé API

    def post(self, request, *args, **kwargs):
        # 1. Vérification de la clé API
        api_key = request.headers.get('X-Hub-Api-Key')
        expected_key = os.environ.get('HUB_API_KEY', 'ethernanos-hub-secret-2026')
        
        if not api_key or api_key != expected_key:
            return Response({"error": "Unauthorized: Invalid API Key"}, status=status.HTTP_401_UNAUTHORIZED)

        # 2. Récupération des données
        tenant_id = request.data.get('tenant_id')
        tenant_name = request.data.get('tenant_name')
        admin_email = request.data.get('admin_email')

        if not tenant_id or not tenant_name:
            return Response({"error": "Missing required fields (tenant_id, tenant_name)"}, status=status.HTTP_400_BAD_REQUEST)

        # Fallback sur ethernanos si l'email n'est pas fourni
        target_email = admin_email if admin_email else 'ethernanos@gmail.com'

        try:
            with transaction.atomic():
                # 3. Créer/Identifier l'utilisateur d'abord (Le Propriétaire/Tenant)
                # On force explicitement is_superuser=False comme exigé par la politique Zero-Leak
                user, u_created = User.objects.get_or_create(
                    email=target_email,
                    defaults={
                        'username': target_email,
                        'is_active': True,
                        'is_staff': True,
                        'is_superuser': False
                    }
                )
                
                # Mot de passe par défaut. Idéalement à randomiser en prod.
                default_password = 'admin1234'
                if u_created:
                    user.set_password(default_password)
                    user.save()

                # 4. Créer/Mettre à jour l'Établissement rattaché à cet utilisateur
                establishment, e_created = Establishment.objects.get_or_create(
                    code=tenant_id,
                    defaults={
                        'name': tenant_name,
                        'user': user # Le lien de propriété
                    }
                )
                
                if not e_created:
                    establishment.name = tenant_name
                    establishment.user = user
                    establishment.save()

                # 5. Assigner le rôle "admin" à l'utilisateur (strictement "admin", pas superuser)
                admin_role, _ = Role.objects.get_or_create(name='admin')
                user.roles.add(admin_role)
                
                # Optionnel: On définit cet établissement comme l'établissement actif de l'user
                user.establishment = establishment
                user.save()

                # 6. Envoi de l'email avec les identifiants
                if u_created:
                    try:
                        send_mail(
                            subject=f"Vos accès Administrateur pour {tenant_name}",
                            message=f"Bonjour,\n\nVotre application School Manage a été déverrouillée.\nVoici vos identifiants d'accès (rôle admin) :\n\nEmail : {target_email}\nMot de passe : {default_password}\n\nMerci d'utiliser EtherNanos.",
                            from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@ethernanos.com',
                            recipient_list=[target_email],
                            fail_silently=True,
                        )
                    except Exception as mail_err:
                        print(f"Erreur lors de l'envoi de l'email : {mail_err}")


                return Response({
                    "status": "success",
                    "message": "Tenant provisioned successfully",
                    "user": user.email,
                    "establishment_code": establishment.code,
                    "establishment_name": establishment.name
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
