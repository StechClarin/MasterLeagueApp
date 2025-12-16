from apps.core.services.BaseService import BaseService
from ..models import ClassRoom, AcademicYear

class YearTransitionService:
    """
    Service dédié à la transition d'année scolaire (Clôture / Ouverture).
    """

    def clone_structure(self, source_year: AcademicYear, target_year: AcademicYear):
        """
        Clone les classes de l'année source vers l'année cible.
        Les Cycles, Niveaux et Matières sont globaux (liés à l'établissement) et n'ont pas besoin d'être clonés.
        """
        if source_year.establishment != target_year.establishment:
            raise ValueError("Impossible de cloner entre deux établissements différents.")

        # Récupération des classes de l'année source
        source_classes = ClassRoom.objects.filter(academic_year=source_year)
        
        created_count = 0
        for old_class in source_classes:
            # On vérifie si la classe existe déjà dans la cible pour éviter les doublons
            exists = ClassRoom.objects.filter(
                academic_year=target_year,
                level=old_class.level,
                name=old_class.name
            ).exists()
            
            if not exists:
                ClassRoom.objects.create(
                    establishment=target_year.establishment,
                    academic_year=target_year,
                    level=old_class.level,
                    name=old_class.name,
                    capacity=old_class.capacity,
                    main_teacher=old_class.main_teacher # On garde le prof principal par défaut
                )
                created_count += 1

        return created_count
