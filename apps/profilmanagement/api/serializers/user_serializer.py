from apps.core.api.serializers.BaseSerializer import BaseSerializer, SmartRelatedField
from ...models import User, Role
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password

class UserSerializer(BaseSerializer):
    # 1. RELATION INTELLIGENTE
    # - Envoi (POST) : [1, 5]
    # - Reçu (GET)  : ["Admin", "Comptable"]
    # roles = SmartRelatedField(...) -> Déplacé vers EstablishmentMembership

    # 2. SÉCURITÉ MOT DE PASSE (Dans le même fichier)
    # write_only=True est la clé : le mot de passe entre, mais ne sort JAMAIS.
    password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'password', 'password2', # Disponibles en écriture
            'photo',
            'is_active', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined']

    # 3. VALIDATION
    def validate(self, attrs):
        # On ne valide le mot de passe que s'il est présent (création ou changement)
        if 'password' in attrs:
            if attrs['password'] != attrs.get('password2'):
                raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
            validate_password(attrs['password'])
        return attrs