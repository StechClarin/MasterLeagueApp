import graphene
from graphene_django.types import DjangoObjectType
from ...models import Student
from .student_health_type import StudentHealthType

class StudentType(DjangoObjectType):
    class Meta:
        model = Student
        fields = "__all__"
    siblings = graphene.List(lambda: StudentType)

    def resolve_siblings(self, info):
        # Siblings are students who share at least one guardian with the current student,
        # excluding the student themselves.
        return Student.objects.filter(
            guardians__in=self.guardians.all()
        ).exclude(id=self.id).distinct()
