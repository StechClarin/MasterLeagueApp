from apps.core.services.BaseService import BaseService
from ..models.subject import Subject
from ..models.level_subject import LevelSubject

class SubjectService(BaseService):
    model = Subject

    def __init__(self):
        super().__init__()
        self._level_subjects_payload = []

    def before_save(self, data, instance=None):
        # 0. Interception des level_subjects avant le save
        print(f"DEBUG: SubjectService.before_save keys: {list(data.keys())}")
        if 'level_subjects' in data:
            print("DEBUG: Popping level_subjects from data")
            self._level_subjects_payload = data.pop('level_subjects')
        else:
            print("DEBUG: level_subjects NOT FOUND in data")
        
        return data

    def after_save(self, instance, created):
        # Gestion des LevelSubjects (Matière par Niveau)
        if self._level_subjects_payload:
            # 1. Nettoyage (on remplace tout pour cette matière ?)
            # Si c'est une update complète, oui. 
            # TODO: Vérifier la stratégie. Ici on assume un remplacement total "Formulaire complet"
            LevelSubject.objects.filter(subject=instance).delete()

            # 2. Création avec injection du contexte
            new_links = []
            import uuid
            
            for item in self._level_subjects_payload:
                establishment_id = self.establishment_id if hasattr(self, 'establishment_id') else None
                
                level_val = item.get('level') or item.get('level_id')
                option_val = item.get('option') or item.get('option_id')
                group_val = item.get('group') or item.get('group_id')
                
                if level_val and establishment_id:
                     # Validation UUID basique pour éviter les erreurs "Id is not a valid UUID"
                     try:
                         # Si c'est déjà une instance, on récupère le PK
                         actual_level_id = level_val.pk if hasattr(level_val, 'pk') else level_val
                         actual_option_id = option_val.pk if hasattr(option_val, 'pk') else option_val
                         actual_group_id = group_val.pk if hasattr(group_val, 'pk') else group_val
                         
                         # On vérifie si c'est un UUID valide
                         if actual_level_id: uuid.UUID(str(actual_level_id))
                         if actual_option_id: uuid.UUID(str(actual_option_id))
                         if actual_group_id: uuid.UUID(str(actual_group_id))
                         
                         kwargs = {
                             'subject': instance,
                             'establishment_id': establishment_id,
                             'level_id': actual_level_id,
                             'option_id': actual_option_id if actual_option_id else None,
                             'group_id': actual_group_id if actual_group_id else None,
                             'coefficient': item.get('coefficient', 1),
                             'hourly_quota': item.get('hourly_quota') or item.get('weekly_hours', 0),
                             'credits': item.get('credits', 0)
                         }
                         new_links.append(LevelSubject(**kwargs))
                     except (ValueError, TypeError):
                         # On ignore les lignes invalides (labels au lieu d'ID, etc.)
                         print(f"DEBUG: Skipping invalid LevelSubject assignment (level={level_val}, option={option_val})")
                         continue
            
            if new_links:
                LevelSubject.objects.bulk_create(new_links)
