from apps.core.services.BaseService import BaseService
from ..models.planningdetail import PlanningDetail
from django.core.exceptions import ValidationError
from django.db.models import Q

class PlanningDetailService(BaseService):
    model = PlanningDetail
    
    def before_save(self, instance):
        # 1. Vérifier que l'établissement est défini (sécurité)
        if not instance.establishment_id:
             pass

        # === Validation des Conflits (Chevauchement) ===
        # Formule : (StartA < EndB) and (EndA > StartB)
        
        # A. Conflit Enseignant
        self._check_overlap(
            instance,
            Q(enseignant=instance.enseignant),
            f"L'enseignant {instance.enseignant} est déjà pris sur ce créneau."
        )
        
        # B. Conflit Salle (si salle définie)
        if instance.salle:
            self._check_overlap(
                instance,
                Q(salle=instance.salle),
                f"La salle {instance.salle} est déjà occupée sur ce créneau."
            )
            
        # C. Conflit Classe
        self._check_overlap(
            instance,
            Q(classe=instance.classe),
            f"La classe {instance.classe} a déjà cours sur ce créneau."
        )

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
