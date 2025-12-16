from apps.core.services.BaseService import BaseService
from ..models.classroom import ClassRoom

from ..models.academic_year import AcademicYear
from django.core.exceptions import ValidationError

class ClassRoomService(BaseService):
    model = ClassRoom

    def before_validate(self, data, instance=None):
        # 0. Appel du parent pour l'injection standard (ex: establishment_id)
        data = super().before_validate(data, instance)

        # 1. Vérification si l'année académique est fournie
        # (NB: DRF passe parfois des IDs ou des instances, selon le Serializer)
        if 'academic_year' not in data and 'academic_year_id' not in data:
            
            # 2. Récupération de l'année active par défaut pour l'établissement courant
            if hasattr(self, 'establishment_id') and self.establishment_id:
                active_year = AcademicYear.objects.filter(
                    establishment_id=self.establishment_id, 
                    is_active=True
                ).first()

                if active_year:
                    # On injecte l'ID (ou l'instance si le Serializer le gère, mais l'ID est plus sûr pour les FK simples)
                    # Si c'est un create via DRF serializer.save(), data est souvent nettoyé. 
                    # DRF attend souvent l'instance pour les champs relationnels si c'est déjà validé ?? 
                    # Non, ici on est dans le Service save, appelé par le Controller.
                    # BaseService.save attend un dictionnaire de données validées (souvent par Serializer).
                    # SI c'est appelé APRES validation Serializer (via serializer.validated_data), alors 'academic_year' devrait déjà être là ou absent.
                    # Si le serializer a ignoré le champ car read_only ou absent, on l'ajoute.
                    
                    data['academic_year'] = active_year.id # Utiliser l'ID pour être sûr que le Serializer le mange bien si c'est du raw data
                else:
                    raise ValidationError("Aucune année académique active trouvée pour cet établissement.")
        
        return data
