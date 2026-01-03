from apps.core.api.serializers.BaseSerializer import BaseSerializer
from ...models import Personnel
from apps.profilmanagement.api.serializers.user_serializer import UserSerializer
from rest_framework import serializers

class UserNestedSerializer(UserSerializer):
    username = serializers.CharField(required=False)
    
    class Meta(UserSerializer.Meta):
        ref_name = "PersonnelUserNestedSerializer" # Prevent swagger conflict
        fields = UserSerializer.Meta.fields
        extra_kwargs = {
            'email': {'validators': []},
            'username': {'validators': []}
        }

class PersonnelSerializer(BaseSerializer):
    user = UserNestedSerializer(required=False)

    class Meta:
        model = Personnel
        fields = "__all__"
