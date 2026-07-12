from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.core.models import Establishment, SyncLog
from apps.profilmanagement.models import User, Role
from django.apps import apps
from django.core.serializers.json import DjangoJSONEncoder
from django.core.exceptions import ObjectDoesNotExist
import json
import os

class InitialSyncView(APIView):
    """
    INITIAL SYNC - "HUB PULL"
    -------------------------
    Cet endpoint est appelé par le Hub EtherNanos lors de son installation physique.
    Le Hub "tire" les données de base (Méta-données Tenant & Super-Admin) depuis le Cloud.
    Le Cloud filtre les données et ne renvoie QUE celles appartenant au Tenant.
    """
    authentication_classes = []
    permission_classes = []

    def get(self, request, *args, **kwargs):
        api_key = request.headers.get('X-Hub-Api-Key')
        expected_key = os.environ.get('HUB_API_KEY', 'ethernanos-hub-secret-2026')
        
        if not api_key or api_key != expected_key:
            return Response({"error": "Unauthorized: Invalid API Key"}, status=status.HTTP_401_UNAUTHORIZED)
            
        tenant_id = request.query_params.get('tenant_id')
        if not tenant_id:
            return Response({"error": "Missing 'tenant_id' parameter"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 1. On trouve les utilisateurs (Admins) qui possèdent ce hub_id
            admin_users = User.objects.filter(hub_id=tenant_id)

            if not admin_users.exists():
                return Response({"error": "No Admin User linked to this Tenant"}, status=status.HTTP_404_NOT_FOUND)

            admin_user = admin_users.first() # Utilisateur de référence pour l'authentification locale du Hub

            # 2. On récupère TOUS les établissements de ces propriétaires
            all_establishments = Establishment.objects.filter(user__in=admin_users)

            # 3. Fonction pour extraire dynamiquement les infos liées
            def get_deep_establishment_data(est):
                # Import dynamique pour éviter les requêtes circulaires
                from apps.core.models import EstablishmentAwareModel
                
                deep_data = {}
                for model in apps.get_models():
                    # Si le modèle hérite de 'EstablishmentAwareModel'
                    if issubclass(model, EstablishmentAwareModel) and model is not EstablishmentAwareModel:
                        meta = getattr(model, '_meta', None)
                        mgr = getattr(model, 'objects', None)
                        if meta and mgr:
                            qs = mgr.filter(establishment=est)
                            if qs.exists():
                                # Dump des valeurs
                                deep_data[meta.model_name] = list(qs.values())
                return deep_data

            # 4. Construction de la réponse structurée
            establishments_payload = []
            for est in all_establishments:
                establishments_payload.append({
                    "id": str(est.id),
                    "code": est.code,
                    "name": est.name,
                    "type": getattr(est, 'type', None),
                    "created_at": est.created_at.isoformat() if est.created_at else None,
                    "related_elements": get_deep_establishment_data(est)
                })

            # Récupération des codes de modules débloqués (licences actives) pour ces utilisateurs
            from apps.core.models import TenantLicense
            active_licenses = TenantLicense.objects.filter(
                user__in=admin_users,
                is_active=True
            ).values_list('module_code', flat=True)

            sync_data = {
                "admin": {
                    "id": str(admin_user.id),
                    "username": admin_user.username,
                    "email": admin_user.email,
                    "first_name": admin_user.first_name,
                    "last_name": admin_user.last_name,
                    "password_hash": admin_user.password, # Le Hub a besoin du Hash pour l'Auth locale !
                    "is_staff": admin_user.is_staff,
                    "is_active": admin_user.is_active,
                    "is_superuser": admin_user.is_superuser,
                    "role": "admin"
                },
                "establishments": establishments_payload,
                "unlocked_module_codes": list(active_licenses)
            }
            
            # Utilisation du JSON Encoder de Django pour gérer les Dates/UUID proprement
            return Response(json.loads(json.dumps(sync_data, cls=DjangoJSONEncoder)), status=status.HTTP_200_OK)

        except ObjectDoesNotExist:
            return Response({"error": f"User with hub_id {tenant_id} not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class SyncInView(APIView):
    """
    SYNC IN - Local Ingestion
    -------------------------
    Appelé par le Hub pour injecter les données "Deep Sync" reçues du Cloud.
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):
        api_key = request.headers.get('X-Hub-Api-Key')
        expected_key = os.environ.get('HUB_API_KEY', 'ethernanos-hub-secret-2026')
        
        if not api_key or api_key != expected_key:
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
            
        data = request.data
        admin_data = data.get('admin')
        establishments = data.get('establishments', [])

        try:
            user = None
            # 1. Ingestion de l'Admin
            if admin_data:
                user, created = User.objects.update_or_create(
                    id=admin_data['id'],
                    defaults={
                        'username': admin_data['username'],
                        'email': admin_data['email'],
                        'first_name': admin_data['first_name'],
                        'last_name': admin_data['last_name'],
                        'password': admin_data['password_hash'], # Password Hash DIRECT !
                        'is_staff': admin_data['is_staff'],
                        'is_active': admin_data['is_active'],
                        'is_superuser': admin_data.get('is_superuser', False)
                    }
                )
                # Assign role if needed

            # 2. Ingestion des Etablissements et Relations
            for est_data in establishments:
                # Créer/Update l'établissement
                est, _ = Establishment.objects.update_or_create(
                    id=est_data['id'],
                    defaults={
                        'name': est_data['name'],
                        'code': est_data['code'],
                        'user': user
                    }
                )

                # Créer/Mettre à jour le membership de propriétaire local pour cet admin
                if user:
                    from apps.core.models.establishment_membership import EstablishmentMembership
                    from apps.profilmanagement.models.role import Role
                    
                    admin_role, _ = Role.objects.get_or_create(name='admin')
                    membership, _ = EstablishmentMembership.objects.update_or_create(
                        user=user,
                        establishment=est,
                        defaults={
                            'is_owner': True,
                            'status': 'active'
                        }
                    )
                    membership.roles.add(admin_role)

                # Ingestion des related_elements (Deep Sync)
                related = est_data.get('related_elements', {})
                for model_name, records in related.items():
                    # Trouver le modèle
                    for model in apps.get_models():
                        if model._meta.model_name == model_name:
                            for record in records:
                                # On convertit les IDs en instances d'objets si nécessaire (FK)
                                # Dans une implémentation simple, values() nous donne déjà l'ID
                                # Django update_or_create gère bien les dictionnaires
                                try:
                                    # Sécurité : on retire 'id' des defaults pour éviter le conflit dans update_or_create
                                    rec_id = record.pop('id', None)
                                    mgr = getattr(model, 'objects', None)
                                    if rec_id and mgr:
                                        mgr.update_or_create(
                                            id=rec_id,
                                            defaults=record
                                        )
                                except Exception as e:
                                    print(f"Error syncing {model_name} record {record.get('id')}: {e}")

            # 3. Ingestion des Licences (Modules Déverrouillés) en BDD locale
            unlocked_codes = data.get('unlocked_module_codes')
            if unlocked_codes is not None:
                from apps.core.models import Module, TenantLicense
                core_codes = ['mod-referentiel', 'mod-administration']
                # Désactiver les modules non-core et non débloqués
                Module.objects.exclude(code__in=core_codes).update(is_active=False)
                # Activer les modules débloqués par la licence
                Module.objects.filter(code__in=unlocked_codes).update(is_active=True)

                # Alimenter la table TenantLicense locale pour la validation des droits
                if user:
                    TenantLicense.objects.filter(user=user).delete()
                    for code in unlocked_codes:
                        if code:
                            TenantLicense.objects.create(
                                user=user,
                                module_code=code,
                                is_active=True
                            )

            # 4. Migration automatique des chemins des fichiers médias existants (Restructuration SaaS Multi-Tenant)
            from django.core.management import call_command
            try:
                call_command('migrate_media_tenant')
            except Exception as e:
                print(f"Warning: Failed to execute migrate_media_tenant during sync: {e}")

            return Response({"status": "Sync In Complete"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SyncDeltaView(APIView):
    """
    SYNC DELTA - Extract local changes
    ---------------------------------
    Expose les entrées SyncLog non synchronisées pour que le Hub puisse les "Pousser".
    """
    authentication_classes = []
    permission_classes = []

    def get(self, request, *args, **kwargs):
        api_key = request.headers.get('X-Hub-Api-Key')
        if not api_key: # Securité basique
             return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        mgr = getattr(SyncLog, 'objects', None)
        if not mgr:
             return Response({"error": "Internal Error: SyncLog manager not found"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        deltas = mgr.filter(is_synced=False)
        return Response(list(deltas.values()), status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        """ Marque les deltas comme synchronisés """
        delta_ids = request.data.get('ids', [])
        mgr = getattr(SyncLog, 'objects', None)
        if mgr:
            mgr.filter(id__in=delta_ids).update(is_synced=True)
        return Response({"status": "Deltas marked as synced"}, status=status.HTTP_200_OK)

class PushDeltaView(APIView):
    """
    PUSH DELTA - Cloud Side
    -----------------------
    Reçoit les modifications locales "Poussées" par le Hub et les applique au Cloud.
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):
        api_key = request.headers.get('X-Hub-Api-Key')
        if api_key != os.environ.get('HUB_API_KEY', 'ethernanos-hub-secret-2026'):
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
            
        deltas = request.data.get('deltas', [])
        # Logique d'application des deltas (similaire à SyncInView mais pour des petits morceaux)
        # TODO: Implémenter la résolution de conflits basique (Last Write Wins)
        
        ack_deltas = []
        for delta in deltas:
            model_name = delta.get('model') or delta.get('model_name')
            action = delta.get('action')  # 'create', 'update', 'delete'
            data = delta.get('data') if delta.get('data') is not None else delta.get('payload')
            if not isinstance(data, dict):
                data = {}

            ack_deltas.append({
                'model': model_name,
                'action': action,
                'fields': dict(list(data.items())[:4])
            })

            try:
                # Resolve model by meta name or class/object name
                target_model = next(
                    (m for m in apps.get_models()
                     if m._meta.model_name == model_name
                     or m.__name__.lower() == (model_name or '').lower()
                     or m._meta.object_name.lower() == (model_name or '').lower()),
                    None
                )

                if not target_model:
                    print(f"Push warning: model '{model_name}' not found")
                    continue

                mgr = getattr(target_model, 'objects', None)
                if action in ['create', 'update'] and mgr:
                    rec_id = data.get('id')
                    payload = {k: v for k, v in data.items() if k != 'id'}
                    if rec_id:
                        mgr.update_or_create(id=rec_id, defaults=payload)
                elif action == 'delete' and mgr:
                    mgr.filter(id=data.get('id')).delete()
            except Exception as e:
                print(f"Push error for {model_name}: {e}")

        return Response({
            "status": "Cloud deltas applied",
            "acknowledged_deltas": ack_deltas
        }, status=status.HTTP_200_OK)