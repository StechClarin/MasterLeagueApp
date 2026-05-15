import graphene
from ...models import Module
from ..Types.module_type import ModuleType
from apps.core.models import Permission, Group

class ModuleQuery(graphene.ObjectType):
    modules = graphene.List(ModuleType)

    def resolve_modules(root, info, **kwargs):
        user = info.context.user

        # 1. SÉCURITÉ : Si pas connecté, liste vide
        if not user.is_authenticated:
            return Module.objects.none()

        from django.db.models import Prefetch
        from apps.core.models import Page

        pages_prefetch = Prefetch('pages', queryset=Page.objects.order_by('order'))

        # 2. SUPERUSER : Il voit tout (Admin) mais limité par la licence active
        if user.is_superuser:
            return Module.objects.filter(is_active=True).prefetch_related(pages_prefetch).order_by('order')

        # 3. UTILISATEUR STANDARD : Filtrage par Tags + Licence
        allowed_tags = set()
        
        if user.roles.exists():
            # A. On récupère tous les groupes liés aux rôles de l'utilisateur
            # (On utilise la relation inverse du ManyToMany : role_set ou le related_name)
            user_groups = Group.objects.filter(role__in=user.roles.all())
            
            # B. On récupère les tags des permissions de ces groupes
            tags = Permission.objects.filter(
                group__in=user_groups
            ).values_list('tag', flat=True).distinct()
            
            allowed_tags = set(tags)

        # 4. FILTRAGE DES PAGES + LICENCE
        # On charge tous les modules débloqués
        all_modules = Module.objects.filter(is_active=True).prefetch_related(pages_prefetch).order_by('order')
        filtered_modules = []

        for module in all_modules:
            allowed_pages = []
            
            for page in module.pages.all():
                # Si la page n'a pas de tag, elle est publique pour les connectés
                if not page.permission_tags:
                    allowed_pages.append(page)
                    continue
                
                # Si l'utilisateur a au moins un des tags requis
                page_tags = set(page.permission_tags)
                if page_tags.intersection(allowed_tags):
                    allowed_pages.append(page)
            
            # Si le module contient des pages visibles, on l'ajoute
            if allowed_pages:
                # Astuce pour ne renvoyer que les pages filtrées
                module._prefetched_objects_cache = {'pages': allowed_pages}
                filtered_modules.append(module)

        return filtered_modules