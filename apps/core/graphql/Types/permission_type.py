import graphene
from graphene_django.types import DjangoObjectType
from apps.core.models.permission import Permission

class PermissionType(DjangoObjectType):
    class Meta:
        model = Permission
        fields = "__all__"
