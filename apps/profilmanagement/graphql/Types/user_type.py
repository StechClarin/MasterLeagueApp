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
        return self.roles.exclude(name__iexact='Admin Master')
