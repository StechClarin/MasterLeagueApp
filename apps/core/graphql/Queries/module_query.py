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
        
        license_restrictions = {}
        if est_id:
            from apps.core.models import TenantLicense, Establishment
            try:
                est = Establishment.objects.get(id=est_id)
                active_licenses = TenantLicense.objects.filter(
                    user=est.user,
                    is_active=True
                )
                unlocked_codes = []
                for lic in active_licenses:
                    unlocked_codes.append(lic.module_code)
                    if lic.allowed_pages:
                        license_restrictions[lic.module_code] = lic.allowed_pages
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

        # 3. FILTRAGE DES PAGES
        all_modules = base_module_query
        filtered_modules = []

        for module in all_modules:
            allowed_pages_in_module = []
            
            # Récupère les restrictions de licence pour ce module
            mod_license_pages = license_restrictions.get(module.code, [])
            
            for page in module.pages.all():
                # 3.1. Vérification au niveau de la licence du Tenant
                # Si la licence a des pages spécifiques définies, on doit s'assurer que la page a un tag correspondant
                if mod_license_pages:
                    page_tags = set(page.permission_tags) if page.permission_tags else set()
                    # Si aucun tag de la page ne correspond aux allowed_pages de la licence, on cache la page
                    if not page_tags.intersection(set(mod_license_pages)):
                        continue

                # 3.2. Vérification au niveau de l'utilisateur
                if is_admin:
                    # Le directeur / superuser voit toutes les pages autorisées par la licence
                    allowed_pages_in_module.append(page)
                else:
                    # Utilisateur standard : vérification des tags
                    if not page.permission_tags:
                        # Page publique (mais autorisée par la licence)
                        allowed_pages_in_module.append(page)
                    else:
                        page_tags = set(page.permission_tags)
                        if page_tags.intersection(allowed_tags):
                            allowed_pages_in_module.append(page)
            
            # Si le module contient des pages visibles, on l'ajoute
            if allowed_pages_in_module:
                module._prefetched_objects_cache = {'pages': allowed_pages_in_module}
                filtered_modules.append(module)

        return filtered_modules