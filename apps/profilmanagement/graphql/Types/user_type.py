import graphene
from graphene_django import DjangoObjectType
from ...models import User
from .role_type import RoleType

class UserType(DjangoObjectType):
    roles = graphene.List(RoleType)

    class Meta:
        model = User
        exclude = ('password',) # Sécurité : on ne renvoie jamais le hash du mot de passe

    def resolve_roles(self, info):
        from apps.profilmanagement.models.role import Role
        request = info.context
        establishment_id = getattr(request, 'establishment_id', None)
        
        if establishment_id:
            membership = self.memberships.filter(establishment_id=establishment_id, status='active').first()
            if membership:
                return membership.roles.exclude(name__iexact='Admin Master')
            return Role.objects.none()
            
        # Si pas de contexte d'établissement, on retourne tous les rôles actifs distincts
        return Role.objects.filter(
            memberships__user=self,
            memberships__status='active'
        ).distinct().exclude(name__iexact='Admin Master')
