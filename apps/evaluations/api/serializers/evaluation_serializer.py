from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import EvaluationSession, EvaluationSubject, EvaluationPlanning, EvaluationSupervision

class EvaluationPlanningSerializer(BaseSerializer):
    class Meta:
        model = EvaluationPlanning
        fields = "__all__"
        read_only_fields = ['created_by_user', 'updated_by_user']


class EvaluationSupervisionSerializer(BaseSerializer):
    class Meta:
        model = EvaluationSupervision
        fields = "__all__"
        read_only_fields = ['created_by_user', 'updated_by_user']


class EvaluationSubjectSerializer(BaseSerializer):
    plannings = EvaluationPlanningSerializer(many=True, read_only=True)
    
    class Meta:
        model = EvaluationSubject
        fields = "__all__"
        read_only_fields = ['created_by_user', 'updated_by_user']


class EvaluationSessionSerializer(BaseSerializer):
    subjects = EvaluationSubjectSerializer(many=True, read_only=True)
    supervisions = EvaluationSupervisionSerializer(many=True, read_only=True)
    
    class Meta:
        model = EvaluationSession
        fields = "__all__"
        read_only_fields = ['created_by_user', 'updated_by_user']
