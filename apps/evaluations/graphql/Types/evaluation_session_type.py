import graphene
from graphene_django.types import DjangoObjectType
from ...models import EvaluationSession

class EvaluationSessionType(DjangoObjectType):
    supervisions = graphene.List("apps.evaluations.graphql.Types.evaluation_supervision_type.EvaluationSupervisionType")

    class Meta:
        model = EvaluationSession
        fields = "__all__"

    def resolve_supervisions(self, info):
        return self.supervisions.all()
