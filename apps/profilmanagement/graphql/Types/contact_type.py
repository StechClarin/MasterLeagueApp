import graphene
from graphene_django.types import DjangoObjectType
from ...models import Contact

class ContactType(DjangoObjectType):
    class Meta:
        model = Contact
        fields = "__all__"
