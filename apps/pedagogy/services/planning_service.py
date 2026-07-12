from apps.core.services.BaseService import BaseService
from ..models import Planning
from uuid import UUID

class PlanningService(BaseService):
    model = Planning

    def before_validate(self, data, instance=None):
        """
        [HOOK] On adapte le payload Frontend (avec suffixes _id) au format attendu par le Serializer (sans suffixes).
        """
        # Appel parent (injection establishment, etc.)
        data = super().before_validate(data, instance)
        
        # --- Règles de Validation pour les Types de Planning ---
        is_global = str(data.get('is_global', getattr(instance, 'is_global', False))).lower() == 'true' or data.get('is_global') is True
        is_specific = str(data.get('is_specific', getattr(instance, 'is_specific', False))).lower() == 'true' or data.get('is_specific') is True
        is_conge = str(data.get('is_conge', getattr(instance, 'is_conge', False))).lower() == 'true' or data.get('is_conge') is True

        from django.core.exceptions import ValidationError

        if is_conge and not is_specific:
            raise ValidationError({"is_conge": "Un congé doit obligatoirement être un planning spécifique."})

        if not data.get('date_start') or not data.get('date_end'):
            raise ValidationError("Les dates de début et de fin sont obligatoires (semaine type pour un planning global, période réelle pour un spécifique/congé).")

        if is_conge:
            # Si c'est un congé, on ignore et on vide les détails envoyés
            if 'details' in data:
                data['details'] = []
        # --------------------------------------------------------
        
        details = data.get('details', [])
        if details and isinstance(details, list):
            for detail in details:
                # Mapping manuel : key_id -> key
                # Le serializer attend 'classe', 'matiere', 'enseignant'
                # Le front envoie 'classe_id', 'matiere_id', 'enseignant_id'
                
                # Classe
                if 'classe_id' in detail:
                    from apps.structure.models.classroom import ClassRoom
                    val = detail.pop('classe_id')
                    if isinstance(val, (str, UUID)):
                        detail['classe'] = ClassRoom.objects.get(id=val)
                    else:
                        detail['classe'] = val
                
                # Matiere
                if 'matiere_id' in detail:
                    from apps.structure.models.subject import Subject
                    val = detail.pop('matiere_id')
                    if isinstance(val, (str, UUID)):
                        detail['matiere'] = Subject.objects.get(id=val)
                    else:
                        detail['matiere'] = val
                
                # Enseignant
                if 'enseignant_id' in detail:
                    from apps.hr.models.personnel import Personnel
                    val = detail.pop('enseignant_id')
                    if isinstance(val, (str, UUID)):
                        detail['enseignant'] = Personnel.objects.get(id=val)
                    else:
                        detail['enseignant'] = val
                    
                # Salle (Optionnel)
                if 'salle_id' in detail:
                    from apps.structure.models.room import Room
                    val = detail.pop('salle_id')
                    if val:
                        if isinstance(val, (str, UUID)):
                            detail['salle'] = Room.objects.get(id=val)
                        else:
                            detail['salle'] = val

        return data

    def before_save(self, data, instance=None):
        # 1. Extraction des détails pour traitement post-save
        # On les stocke temporairement dans l'instance du service
        self._details_to_save = data.pop('details', [])
        
        # 2. Appel du parent (Safety Net establishment)
        return super().before_save(data, instance)

    def after_save(self, instance, created):
        """
        Gère l'enregistrement des détails (cours) après la sauvegarde du planning.
        """
        from .planning_detail_service import PlanningDetailService
        detail_service = PlanningDetailService()

        details_data = getattr(self, '_details_to_save', [])
        
        if details_data:
            print(f"[PlanningService] Saving {len(details_data)} details for Planning {instance.id}")
            for detail in details_data:
                # Injection de la FK vers le planning parent
                detail['planning_id'] = instance.id
                
                # Injection de l'établissement si manquant (héritage)
                if not detail.get('establishment_id') and instance.establishment_id:
                     detail['establishment_id'] = instance.establishment_id
                     
                # Sauvegarde via le service dédié
                try:
                    # On utilise save du service détail (qui gère create/update si ID présent)
                    detail_service.save(detail)
                except Exception as e:
                    print(f"Error saving detail: {e}")
                    raise e
        
        # Nettoyage
        self._details_to_save = []
