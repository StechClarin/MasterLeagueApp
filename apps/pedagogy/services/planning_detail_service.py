from apps.core.services.BaseService import BaseService
from ..models.planningdetail import PlanningDetail
from django.core.exceptions import ValidationError
from django.db.models import Q

class PlanningDetailService(BaseService):
    model = PlanningDetail
    
    def before_save(self, data, instance=None):
        # Création d'une instance temporaire pour la validation (Overlap)
        # data contient des objets (liés par le serializer) ou des valeurs brutes
        
        is_creation = instance is None
        
        if is_creation:
            # Attention : data peut contenir des objets (FK resolues)
            # On instancie proprement
            valid_fields = {k: v for k, v in data.items() if hasattr(self.model, k) or k == 'id'}
            temp_instance = self.model(**valid_fields)
        else:
            temp_instance = instance
            # On applique les changements (simulation)
            for k, v in data.items():
                if hasattr(temp_instance, k):
                    setattr(temp_instance, k, v)

        # 1. Vérifier que l'établissement est défini (sécurité)
        # Si manquante, BaseService l'injectera après, mais pour le check on en a besoin
        # Si on est en nested create, l'establishment est dans data['establishment']
        
        # === Validation des Conflits (Chevauchement) ===
        # Formule : (StartA < EndB) and (EndA > StartB)
        
        # A. Conflit Enseignant
        if temp_instance.enseignant:
             self._check_overlap(
                temp_instance,
                Q(enseignant=temp_instance.enseignant),
                f"L'enseignant {temp_instance.enseignant} est déjà pris sur ce créneau."
            )
        
        # B. Conflit Salle (si salle définie)
        if temp_instance.salle:
            self._check_overlap(
                temp_instance,
                Q(salle=temp_instance.salle),
                f"La salle {temp_instance.salle} est déjà occupée sur ce créneau."
            )
            
        # C. Conflit Classe
        if temp_instance.classe:
            self._check_overlap(
                temp_instance,
                Q(classe=temp_instance.classe),
                f"La classe {temp_instance.classe} a déjà cours sur ce créneau."
            )
            
        return data

    def _check_overlap(self, instance, specific_filter, error_msg):
        query = self.model.objects.filter(
            establishment_id=instance.establishment_id,
            date=instance.date
        ).filter(specific_filter)
        
        # Exclure soi-même (Update)
        if instance.pk:
            query = query.exclude(pk=instance.pk)
            
        # Filtre de chevauchement
        # Existing.start < New.end AND Existing.end > New.start
        query = query.filter(
            heure_debut__lt=instance.heure_fin,
            heure_fin__gt=instance.heure_debut
        )
        
        if query.exists():
            conflict = query.first()
            raise ValidationError(f"{error_msg} (Conflit avec : {conflict})")
