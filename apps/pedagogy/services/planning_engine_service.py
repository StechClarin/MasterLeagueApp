from datetime import timedelta, date
from django.db.models import Q
from apps.pedagogy.models import Planning, PlanningDetail
from apps.evaluations.models.evaluation_planning import EvaluationPlanning

class PlanningEngineService:
    """
    Service responsable de la "compilation" de l'emploi du temps.
    Il superpose les Congés, les Plannings Spécifiques, et les Plannings Globaux
    pour retourner un emploi du temps propre sur une période donnée.
    """

    @staticmethod
    def get_compiled_schedule(establishment_id, start_date: date, end_date: date, classroom_id=None, personnel_id=None):
        """
        Retourne la liste des créneaux (PlanningDetail virtuels ou réels) pour la période demandée.
        - establishment_id: Obligatoire (pour filtrer les données du tenant).
        - start_date, end_date: La fenêtre de temps (ex: lundi au dimanche).
        - classroom_id: Optionnel, pour cibler l'emploi du temps d'une classe.
        - personnel_id: Optionnel, pour cibler l'emploi du temps d'un professeur.
        """
        
        # 1. Requête de base pour les plannings parents (actifs dans l'établissement)
        planning_qs = Planning.objects.filter(establishment_id=establishment_id)

        # On pré-charge les plannings qui pourraient nous intéresser.
        # - Les Globaux (qui s'appliquent théoriquement tout le temps)
        # - Les Spécifiques / Congés (qui recouvrent au moins une partie de la fenêtre demandée)
        
        plannings = planning_qs.filter(
            Q(is_global=True) |
            Q(is_specific=True, date_start__lte=end_date, date_end__gte=start_date)
        ).prefetch_related('target_classes')

        # Séparation en catégories
        global_plannings = []
        specific_plannings = []
        conge_plannings = []

        for p in plannings:
            # Vérifier la portée (target_classes)
            if classroom_id:
                targets = p.target_classes.all()
                if targets.exists() and not targets.filter(id=classroom_id).exists():
                    continue # Ce planning ne concerne pas cette classe

            if p.is_conge:
                conge_plannings.append(p)
            elif p.is_specific:
                specific_plannings.append(p)
            elif p.is_global:
                global_plannings.append(p)

        # 2. Construction jour par jour
        compiled_details = []
        current_date = start_date

        # Pour les plannings globaux, on précharge leurs détails
        global_details_qs = PlanningDetail.objects.filter(
            planning__in=global_plannings,
            is_cancelled=False # On ignore les détails globaux annulés de base (s'il y en a)
        ).select_related('matiere', 'enseignant', 'salle', 'classe')
        
        if classroom_id:
            global_details_qs = global_details_qs.filter(classe_id=classroom_id)
        if personnel_id:
            global_details_qs = global_details_qs.filter(enseignant_id=personnel_id)
            
        global_details = list(global_details_qs)

        # Pour les plannings spécifiques, on précharge aussi
        specific_details_qs = PlanningDetail.objects.filter(
            planning__in=specific_plannings,
            date__gte=start_date,
            date__lte=end_date
        ).select_related('matiere', 'enseignant', 'salle', 'classe')
        
        if classroom_id:
            specific_details_qs = specific_details_qs.filter(classe_id=classroom_id)
        if personnel_id:
            specific_details_qs = specific_details_qs.filter(enseignant_id=personnel_id)
            
        specific_details = list(specific_details_qs)

        # 1.5 Requête des Examens
        exams_qs = EvaluationPlanning.objects.filter(
            establishment_id=establishment_id,
            date__gte=start_date,
            date__lte=end_date
        ).select_related('evaluation_subject__subject').prefetch_related('classrooms')
        
        if classroom_id:
            exams_qs = exams_qs.filter(classrooms__id=classroom_id)
            
        exams_list = list(exams_qs)

        while current_date <= end_date:
            # A. Vérifier si ce jour est un CONGÉ pour les cibles demandées
            is_holiday_today = False
            for c in conge_plannings:
                if c.date_start <= current_date <= c.date_end:
                    is_holiday_today = True
                    # On pourrait ajouter un faux "Détail" de type congé pour affichage
                    compiled_details.append({
                        'id': f"conge-{c.id}-{current_date}",
                        'type': 'HOLIDAY',
                        'title': c.nom,
                        'date': current_date.isoformat(),
                        'heureDebut': '00:00',
                        'heureFin': '23:59',
                        'matiere': None,
                        'enseignant': None,
                        'classe': None,
                        'salle': None
                    })
                    break # Pas besoin de chercher d'autres congés pour ce jour
            
            if is_holiday_today:
                current_date += timedelta(days=1)
                continue # On passe au jour suivant, rien d'autre à afficher

            # B. Chercher les plannings SPÉCIFIQUES pour ce jour
            specifics_today = [d for d in specific_details if d.date == current_date]
            
            # Si un détail spécifique est marqué is_cancelled=True, c'est une exception (ex: prof absent).
            # Il sert à bloquer le global, mais on ne l'affiche pas (ou on l'affiche différemment).
            valid_specifics = [d for d in specifics_today if not d.is_cancelled]
            cancelled_specifics = [d for d in specifics_today if d.is_cancelled]
            
            # C. Chercher les EXAMENS pour ce jour
            exams_today = [e for e in exams_list if e.date == current_date]
            valid_exams = [e for e in exams_today if not getattr(e, 'is_cancelled', False)]
            cancelled_exams = [e for e in exams_today if getattr(e, 'is_cancelled', False)]

            # D. Chercher les plannings GLOBAUX pour ce jour de la semaine
            # Astuce: On compare le jour de la semaine (weekday)
            target_weekday = current_date.weekday() # 0 = Lundi, 6 = Dimanche
            
            globals_today = []
            for gd in global_details:
                if gd.date.weekday() == target_weekday:
                    # Vérifier s'il est "annulé" ou "écrasé" par un spécifique aujourd'hui
                    # Règle simple : Si un spécifique (annulé ou non) se passe à la même heure pour la même classe/prof, le global saute.
                    conflit = False
                    # Vérif conflit avec spécifique
                    for sd in specifics_today:
                        if (sd.heure_debut < gd.heure_fin) and (sd.heure_fin > gd.heure_debut):
                            if sd.classe_id == gd.classe_id or sd.enseignant_id == gd.enseignant_id:
                                conflit = True
                                break
                    
                    # Vérif conflit avec examen
                    if not conflit:
                        for ed in valid_exams:
                            if not ed.start_time or not ed.duration_minutes:
                                continue
                            
                            from datetime import datetime, date as dt_date
                            exam_start = ed.start_time
                            exam_end = (datetime.combine(dt_date.today(), exam_start) + timedelta(minutes=ed.duration_minutes)).time()
                            
                            if (exam_start < gd.heure_fin) and (exam_end > gd.heure_debut):
                                # Vérifier si la classe de ce cours global est concernée par l'examen
                                if ed.classrooms.filter(id=gd.classe_id).exists():
                                    conflit = True
                                    break

                    if not conflit:
                        globals_today.append(gd)

            # --- Assemblage pour la journée ---
            for d in valid_specifics:
                compiled_details.append(PlanningEngineService._format_detail(d, 'SPECIFIC', current_date))
                
            for d in cancelled_specifics:
                if d.rescheduled_to:
                    compiled_details.append(PlanningEngineService._format_detail(d, 'RESCHEDULED', current_date))
                else:
                    compiled_details.append(PlanningEngineService._format_detail(d, 'CANCELLED', current_date))
                
            for e in valid_exams:
                if e.start_time and e.duration_minutes:
                    compiled_details.append(PlanningEngineService._format_exam(e, current_date))
                    
            for e in cancelled_exams:
                if e.start_time and e.duration_minutes:
                    compiled_details.append(PlanningEngineService._format_exam(e, current_date))
                
            for d in globals_today:
                compiled_details.append(PlanningEngineService._format_detail(d, 'GLOBAL', current_date))

            current_date += timedelta(days=1)

        return compiled_details

    @staticmethod
    def _format_detail(detail, p_type, target_date):
        """Formate le modèle PlanningDetail en dictionnaire standardisé pour l'API Frontend"""
        return {
            'id': f"{p_type.lower()}-{detail.id}-{target_date}",
            'real_id': str(detail.id),
            'type': p_type, # 'GLOBAL' ou 'SPECIFIC'
            'title': detail.matiere.name if detail.matiere else 'Cours',
            'date': target_date.isoformat(),
            'heureDebut': detail.heure_debut.strftime('%H:%M'),
            'heureFin': detail.heure_fin.strftime('%H:%M'),
            'matiere': {'id': str(detail.matiere.id), 'name': detail.matiere.name} if detail.matiere else None,
            'enseignant': {
                'id': str(detail.enseignant.id),
                'user': {
                    'firstName': getattr(detail.enseignant.user, 'first_name', '') if detail.enseignant.user else '', 
                    'lastName': getattr(detail.enseignant.user, 'last_name', '') if detail.enseignant.user else ''
                }
            } if detail.enseignant else None,
            'classe': {'id': str(detail.classe.id), 'name': detail.classe.name} if detail.classe else None,
            'salle': {'id': str(detail.salle.id), 'name': detail.salle.name} if detail.salle else None,
            'rescheduledTo': detail.rescheduled_to.isoformat() if hasattr(detail, 'rescheduled_to') and detail.rescheduled_to else None,
            'isExam': False
        }

    @staticmethod
    def _format_exam(exam, target_date):
        """Formate une planification d'examen en événement calendrier"""
        from datetime import datetime, date as dt_date
        exam_end = (datetime.combine(dt_date.today(), exam.start_time) + timedelta(minutes=exam.duration_minutes)).time()
        
        p_type = 'EXAM'
        if getattr(exam, 'is_cancelled', False):
            p_type = 'RESCHEDULED' if getattr(exam, 'rescheduled_to', None) else 'CANCELLED'
            
        return {
            'id': f"exam-{exam.id}-{target_date}",
            'real_id': str(exam.id),
            'type': p_type,
            'title': f"EXAMEN: {exam.evaluation_subject.subject.name}",
            'date': target_date.isoformat(),
            'heureDebut': exam.start_time.strftime('%H:%M'),
            'heureFin': exam_end.strftime('%H:%M'),
            'matiere': {'id': str(exam.evaluation_subject.subject.id), 'name': exam.evaluation_subject.subject.name},
            'enseignant': None, # Un examen n'a pas un enseignant assigné dans la vue élève
            'classe': None, # On ne renvoie pas la classe pour simplifier (c'est filtré)
            'salle': None, # On pourrait envoyer les salles, mais la relation est multiple
            'rescheduledTo': exam.rescheduled_to.isoformat() if getattr(exam, 'rescheduled_to', None) else None,
            'isExam': True
        }
