# apps/core/api/serializers/establishment_membership_serializer.py
from rest_framework import serializers
from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models.establishment_membership import EstablishmentMembership

class EstablishmentMembershipSerializer(BaseSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    establishment_name = serializers.CharField(source='establishment.name', read_only=True)

    class Meta:
        model = EstablishmentMembership
        fields = [
            'id', 'user', 'username', 'establishment', 
            'establishment_name', 'roles', 'is_owner', 'status',
            'created_at', 'updated_at'
        ]
