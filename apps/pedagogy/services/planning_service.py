from apps.core.services.BaseService import BaseService
from ..models import Planning

class PlanningService(BaseService):
    model = Planning

    def after_save(self, instance, data):
        """
        Gère l'enregistrement des détails (cours) après la sauvegarde du planning.
        Ceci est nécessaire car les détails ont besoin de l'ID du planning parent.
        """
        from .planning_detail_service import PlanningDetailService
        detail_service = PlanningDetailService()

        details_data = data.get('details', [])
        
        # Si aucun détail n'est envoyé, on ne fait rien (ou on pourrait tout supprimer si c'était une synchro stricte)
        # Ici on suppose qu'on traite la liste envoyée.
        if details_data:
            print(f"[PlanningService] Saving {len(details_data)} details for Planning {instance.id}")
            for detail in details_data:
                # Injection de la FK vers le planning parent
                detail['planning_id'] = instance.id
                
                # Injection de l'établissement si manquant (héritage)
                if not detail.get('establishment_id') and instance.establishment_id:
                     detail['establishment_id'] = instance.establishment_id
                     
                # Sauvegarde via le service dédié (qui gère les validations métier)
                try:
                    detail_service.save(detail)
                except Exception as e:
                    # En cas d'erreur sur un détail, on log ou on remonte l'erreur ?
                    # Pour l'instant on laisse péter pour informer le client
                    raise e
