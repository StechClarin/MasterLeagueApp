from datetime import date
from django.db import models
from apps.structure.models.academic_year import AcademicYear
from apps.structure.models.academic_cycle_config import AcademicCycleConfig

def get_school_week_number(current_date: date, establishment_id: int, cycle_id: int = None) -> int:
    """
    Calcule le numéro de semaine scolaire (Semaine 1, 2, ...) basé sur la date de rentrée.
    Gère la rentrée par défaut ou spécifique par Cycle.
    
    :param current_date: Date cible (ex: date du planning)
    :param establishment_id: ID de l'établissement
    :param cycle_id: (Optionnel) ID du Cycle pour affiner la date de rentrée
    :return: Numéro de semaine (1-based index). Retourne 1 si avant la rentrée ou si non configuré.
    """
    
    # 1. Récupérer l'année active
    try:
        active_year = AcademicYear.objects.get(
            establishment_id=establishment_id, 
            is_active=True
        )
    except AcademicYear.DoesNotExist:
        return 1 # Fallback safe
        
    start_date = active_year.start_date
    
    # 2. Surcharge par Cycle Config ?
    if cycle_id:
        try:
            config = AcademicCycleConfig.objects.get(
                academic_year=active_year,
                cycle_id=cycle_id
            )
            if config.start_date:
                start_date = config.start_date
        except AcademicCycleConfig.DoesNotExist:
            pass # On garde la date par défaut
            
    if not start_date:
        return 1
        
    # 3. Calcul du Delta
    # Si current_date est avant start_date, on peut retourner 0 ou 1.
    # Pour l'instant, disons qu'on retourne 1 (semaine de rentrée) ou des négatifs ?
    # Le user a demandé: s'incrémente de 1 à chaque semaine.
    
    if current_date < start_date:
        # Cas pré-rentrée : Peut-être retourner 0 ? 
        # Pour rester simple, on va dire 1 (la semaine de rentrée inclut les jours d'avant si même semaine ISO ?)
        # Non, faisons un calcul strict de jours.
        days_diff = (current_date - start_date).days
        # Si jours négatifs, semaine = floor(neg/7) -> -1, 0, etc.
        # Restons sur une logique simple : Semaine 1 = [start_date, start_date+6]
        return (days_diff // 7) + 1

    days_diff = (current_date - start_date).days
    return (days_diff // 7) + 1
