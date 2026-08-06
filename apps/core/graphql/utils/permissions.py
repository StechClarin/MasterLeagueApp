from functools import wraps
from graphql import GraphQLError

def has_permission(required_permission):
    """
    Décorateur GraphQL pour valider les permissions contextuelles d'un utilisateur
    en fonction de l'établissement actif (X-Establishment-ID).
    """
    def decorator(resolver):
        @wraps(resolver)
        def wrapper(root, info, *args, **kwargs):
            user = getattr(info.context, 'user', None)
            
            # 1. Vérification de l'authentification
            if not user or not user.is_authenticated:
                raise GraphQLError("Non authentifié : Un token d'accès valide est requis.")
                
            # 2. Bypass global pour le Super Admin (ethernanos) ou les opérations root
            if user.is_superuser:
                return resolver(root, info, *args, **kwargs)
                
            est_id = getattr(info.context, 'establishment_id', None)
            
            if est_id:
                # 2.1. Vérification de la licence de l'établissement pour la fonctionnalité demandée
                from apps.core.models.tenant_license import TenantLicense
                if not TenantLicense.verify_access(info.context, est_id, required_permission):
                    raise GraphQLError(f"Accès refusé : Votre licence d'établissement ne comprend pas la fonctionnalité '{required_permission}'.")
                
                from apps.core.models.establishment_membership import EstablishmentMembership
                from apps.core.models.permission import Permission
                from django.core.exceptions import ObjectDoesNotExist
                
                # 3. Vérification de l'appartenance à l'établissement (Membership)
                try:
                    membership = EstablishmentMembership.objects.get(
                        user=user, 
                        establishment_id=est_id,
                        status='active'
                    )
                except ObjectDoesNotExist:
                    raise GraphQLError("Accès refusé : Vous n'êtes pas rattaché à cet établissement actif.")
                
                # 4. Bypass local pour le propriétaire de l'établissement
                if membership.is_owner:
                    return resolver(root, info, *args, **kwargs)
                    
                # 5. Vérification de la permission exacte dans les rôles du membership
                has_perm = Permission.objects.filter(
                    group__roles__memberships=membership,
                    codename=required_permission
                ).exists()
                
                if not has_perm:
                    # Fallback sur les permissions directes si jamais on a lié une permission directement au rôle
                    has_perm_direct = Permission.objects.filter(
                        roles__memberships=membership,
                        codename=required_permission
                    ).exists()
                    
                    if not has_perm_direct:
                        raise GraphQLError(f"Permission refusée : L'action nécessite le privilège '{required_permission}'.")
                        
            else:
                # 6. Rejet sécurisé par défaut si aucun contexte d'établissement n'est fourni
                # Pour le moteur GraphQL "Industriel", toute opération nécessitant un droit
                # métier nécessite un contexte d'établissement.
                raise GraphQLError("Contexte invalide : Identifiant d'établissement manquant (X-Establishment-ID).")
                
            return resolver(root, info, *args, **kwargs)
        return wrapper
    return decorator
