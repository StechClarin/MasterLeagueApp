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
            for item in self._level_subjects_payload:
                # Injection automatique de l'établissement et du subject
                establishment_id = self.establishment_id if hasattr(self, 'establishment_id') else None
                
                # Attention: item peut être un dict brutes (si bypass serializer) ou OrderedDict
                # On s'assure d'avoir les données minimale
                level_val = item.get('level') or item.get('level_id')
                if level_val and establishment_id:
                     # Préparez les arguments de base
                     kwargs = {
                         'subject': instance,
                         'establishment_id': establishment_id,
                         'coefficient': item.get('coefficient', 1),
                         'hourly_quota': item.get('hourly_quota') or item.get('weekly_hours', 0)
                     }
                     
                     # Gestion polymorphe : Instance vs ID
                     # Si le serializer a validé, 'level' est une instance de Level
                     if hasattr(level_val, 'pk'):
                         kwargs['level'] = level_val
                     else:
                         kwargs['level_id'] = level_val
                         
                     new_links.append(LevelSubject(**kwargs))
            
            if new_links:
                LevelSubject.objects.bulk_create(new_links)
