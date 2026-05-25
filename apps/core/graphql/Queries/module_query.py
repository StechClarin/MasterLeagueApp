import graphene
from ...models import Module
from ..Types.module_type import ModuleType
from apps.core.models import Permission, Group

class ModuleQuery(graphene.ObjectType):
    modules = graphene.List(ModuleType)

    def resolve_modules(root, info, **kwargs):
        user = getattr(info.context, 'user', None)

        # 1. SÉCURITÉ : Si pas connecté, liste vide
        if not user or not user.is_authenticated:
            return Module.objects.none()

        from django.db.models import Prefetch
        from apps.core.models import Page
        from django.db.models import Q

        pages_prefetch = Prefetch('pages', queryset=Page.objects.order_by('order'))

        # --- GESTION DES LICENCES PAR PROPRIÉTAIRE (TENANT) ---
        est_id = getattr(info.context, 'establishment_id', None)
        
        if est_id:
            from apps.core.models import TenantLicense, Establishment
            try:
                est = Establishment.objects.get(id=est_id)
                unlocked_codes = TenantLicense.objects.filter(
                    user=est.user,
                    is_active=True
                ).values_list('module_code', flat=True)
            except Establishment.DoesNotExist:
                unlocked_codes = []

            core_codes = ['mod-referentiel', 'mod-administration']
            base_module_query = Module.objects.filter(
                Q(code__in=core_codes) | Q(code__in=unlocked_codes)
            )
        else:
            base_module_query = Module.objects.filter(is_active=True)

        base_module_query = base_module_query.prefetch_related(pages_prefetch).order_by('order').distinct()

        # 2. VÉRIFICATION DES DROITS (Context-Aware)
        is_admin = user.is_superuser
        allowed_tags = set()

        if not is_admin and est_id:
            from apps.core.models.establishment_membership import EstablishmentMembership
            from django.core.exceptions import ObjectDoesNotExist
            try:
                membership = EstablishmentMembership.objects.get(
                    user=user, 
                    establishment_id=est_id,
                    status='active'
                )
                if membership.is_owner:
                    is_admin = True
                else:
                    # Récupération des tags via les groupes des rôles de CE membership
                    tags = Permission.objects.filter(
                        group__roles__memberships=membership
                    ).values_list('tag', flat=True).distinct()
                    allowed_tags = set(tags)
                    
                    # Tags via permissions directes sur les rôles (au cas où)
                    direct_tags = Permission.objects.filter(
                        roles__memberships=membership
                    ).values_list('tag', flat=True).distinct()
                    allowed_tags.update(direct_tags)
                    
            except ObjectDoesNotExist:
                return [] # Aucun droit sur cet établissement

        # Si admin (Superuser ou Owner), on renvoie tout ce que la licence permet
        if is_admin:
            return base_module_query

        # 3. FILTRAGE DES PAGES POUR L'UTILISATEUR STANDARD
        all_modules = base_module_query
        filtered_modules = []

        for module in all_modules:
            allowed_pages = []
            
            for page in module.pages.all():
                # Si la page n'a pas de tag, elle est publique
                if not page.permission_tags:
                    allowed_pages.append(page)
                    continue
                
                # Vérifie si l'utilisateur a au moins un des tags requis
                page_tags = set(page.permission_tags)
                if page_tags.intersection(allowed_tags):
                    allowed_pages.append(page)
            
            # Si le module contient des pages visibles, on l'ajoute
            if allowed_pages:
                module._prefetched_objects_cache = {'pages': allowed_pages}
                filtered_modules.append(module)

        return filtered_modules