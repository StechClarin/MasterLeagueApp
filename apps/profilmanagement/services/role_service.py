from apps.core.services.BaseService import BaseService
from ..models import Role

class RoleService(BaseService):
    model = Role

    # Les méthodes create, update, delete sont gérées par BaseService
    def save_process(self, data, instance=None):
        """
        Surcharge pour gérer les permissions (ManyToMany).
        """
        # 1. On extrait les permissions (car save() ne gère pas les M2M directement)
        permissions = data.pop('permissions', None)
        
        # 2. Sauvegarde standard (Role)
        role, created = super().save_process(data, instance)
        
        # 3. Sauvegarde des Permissions (si fournies)
        if permissions is not None:
            # On remplace tout par la nouvelle liste
            role.permissions.set(permissions)
            
        return role, created
