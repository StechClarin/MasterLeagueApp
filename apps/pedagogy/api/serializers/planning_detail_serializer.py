from apps.core.api.serializers.BaseSerializer import BaseSerializer, SmartRelatedField
from ...models.planningdetail import PlanningDetail
from ...models.planning import Planning
from apps.structure.models import ClassRoom, Subject
from apps.hr.models import Personnel

class PlanningDetailSerializer(BaseSerializer):
    # On utilise SmartRelatedField pour permettre l'envoi d'ID et la lecture d'objets (str)
    planning = SmartRelatedField(queryset=Planning.objects.all(), required=False)
    classe = SmartRelatedField(queryset=ClassRoom.objects.all(), required=False) # Frontend envoie classe_id
    matiere = SmartRelatedField(queryset=Subject.objects.all(), required=False)
    enseignant = SmartRelatedField(queryset=Personnel.objects.all(), required=False)

    class Meta:
        model = PlanningDetail
        fields = '__all__'
        extra_kwargs = {
            'establishment': {'required': False}, # Géré par le parent ou BaseSerializer
            'planning': {'required': False}       # Géré par le parent lors du nested create
        }

    def to_representation(self, instance):
        """
        Surcharge pour renvoyer des objets complets (plus riche) en lecture,
        tout en gardant les IDs en écriture (via SmartRelatedField).
        """
        data = super().to_representation(instance)
        
        # 1. Classe
        if instance.classe:
            data['classe'] = {
                "id": instance.classe.id,
                "name": instance.classe.name,
                "capacity": instance.classe.capacity
            }

        # 2. Matière
        if instance.matiere:
            data['matiere'] = {
                "id": instance.matiere.id,
                "name": instance.matiere.name,
                "code": instance.matiere.code
            }

        # 3. Enseignant
        if instance.enseignant:
            # Construction du nom complet
            user = instance.enseignant.user
            full_name = "-"
            if user:
                full_name = f"{user.first_name} {user.last_name}".strip()
            
            data['enseignant'] = {
                "id": instance.enseignant.id,
                "matricule": instance.enseignant.matricule,
                "full_name": full_name if full_name else instance.enseignant.matricule
            }

        return data
