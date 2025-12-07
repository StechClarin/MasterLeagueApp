from rest_framework import serializers
from apps.core.api.serializers.BaseSerializer import BaseSerializer


from ...models import Role
from apps.core.models.permission import Permission

class RoleSerializer(BaseSerializer):
    permissions = serializers.PrimaryKeyRelatedField(many=True, read_only=False, queryset=Permission.objects.all())

    class Meta:
        model = Role
        fields = "__all__"
