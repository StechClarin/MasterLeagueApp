from rest_framework import serializers
from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import Option

class OptionSerializer(BaseSerializer):
    class Meta:
        model = Option
        fields = "__all__"

    def validate(self, attrs):
        cycle = attrs.get('cycle')
        parent = attrs.get('parent')

        # 1. Validation du Cycle (si présent)
        if cycle and not cycle.has_options:
            raise serializers.ValidationError({
                "cycle": f"Le cycle '{cycle.name}' ne permet pas la création d'options."
            })

        # 2. Cohérence Parent/Enfant
        if parent and cycle:
            if parent.cycle and parent.cycle != cycle:
                raise serializers.ValidationError({
                    "cycle": "La spécialité doit appartenir au même cycle que sa filière parente."
                })
        
        # Si le parent a un cycle et que l'enfant n'en a pas, on hérite automatiquement
        if parent and parent.cycle and not cycle:
            attrs['cycle'] = parent.cycle

        return super().validate(attrs)
