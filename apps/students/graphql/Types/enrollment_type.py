import graphene
from graphene_django.types import DjangoObjectType
from ...models import Enrollment

class EnrollmentType(DjangoObjectType):
    class Meta:
        model = Enrollment
        fields = "__all__"
