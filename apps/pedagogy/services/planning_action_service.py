from apps.core.services.BaseService import BaseService
from apps.pedagogy.models import Planning, PlanningDetail
from apps.evaluations.models.evaluation_planning import EvaluationPlanning
from datetime import datetime, date as dt_date
import uuid

class PlanningActionService(BaseService):
    """
    Service dédié aux actions complexes sur l'emploi du temps : Annulation et Report.
    Ce service gère la logique de création d'exceptions pour les cours globaux.
    """
    # Ce service ne gère pas un modèle unique (CUD standard), il orchestre plusieurs modèles.
    model = None

    def _check_conflicts(self, event_id, event_type, new_date_obj, start_time_obj, end_time_obj, establishment_id, new_room_id=None):
        from apps.pedagogy.services.planning_engine_service import PlanningEngineService
        
        # 1. Obtenir les infos de l'événement d'origine
        original_classes = set()
        original_teachers = set()
        original_rooms = set()
        
        if event_type == 'EXAM':
            exam = EvaluationPlanning.objects.get(id=event_id, establishment_id=establishment_id)
            original_classes.update([str(c) for c in exam.classrooms.values_list('id', flat=True)])
            original_rooms.update([str(r) for r in exam.rooms.values_list('id', flat=True)])
        else:
            detail = PlanningDetail.objects.get(id=event_id, planning__establishment_id=establishment_id)
            if detail.classe_id:
                original_classes.add(str(detail.classe_id))
            if detail.enseignant_id:
                original_teachers.add(str(detail.enseignant_id))
            if detail.salle_id:
                original_rooms.add(str(detail.salle_id))

        if new_room_id:
            original_rooms = {str(new_room_id)}
                
        # 2. Obtenir l'emploi du temps compilé pour le jour ciblé
        compiled_schedule = PlanningEngineService.get_compiled_schedule(
            establishment_id=establishment_id,
            start_date=new_date_obj,
            end_date=new_date_obj
        )
        
        # 3. Analyser les conflits
        for evt in compiled_schedule:
            if evt['type'] in ['CANCELLED', 'RESCHEDULED']:
                continue
                
            if evt['type'] == 'HOLIDAY':
                return "Impossible de reporter à cette date : c'est un jour de congé."
                
            # Ignorer l'événement lui-même s'il est déjà prévu ce jour-là
            if evt['real_id'] == str(event_id) and evt['isExam'] == (event_type == 'EXAM'):
                continue
                
            evt_start = datetime.strptime(evt['heureDebut'], '%H:%M').time()
            evt_end = datetime.strptime(evt['heureFin'], '%H:%M').time()
            
            # Vérifier l'intersection temporelle
            if (start_time_obj < evt_end) and (end_time_obj > evt_start):
                conflict_reason = None
                
                # Le compiled evt a-t-il la même classe ?
                if evt.get('classe') and str(evt['classe']['id']) in original_classes:
                    conflict_reason = f"La classe {evt['classe']['name']} a déjà cours ({evt['title']})."
                    
                # Le prof ?
                elif evt.get('enseignant') and str(evt['enseignant']['id']) in original_teachers:
                    conflict_reason = f"L'enseignant est déjà occupé ({evt['title']})."
                    
                # La salle ?
                elif evt.get('salle') and str(evt['salle']['id']) in original_rooms:
                    conflict_reason = f"La salle {evt['salle']['name']} est déjà occupée ({evt['title']})."
                    
                if conflict_reason:
                    return f"Conflit détecté : {conflict_reason}"
                    
        return None # Aucun conflit


    def cancel_event(self, event_id, target_date, event_type, establishment_id, user_id=None):
        """
        Annule une occurrence spécifique d'un événement.
        """
        target_date_obj = datetime.strptime(target_date, '%Y-%m-%d').date()

        if event_type == 'EXAM':
            exam = EvaluationPlanning.objects.get(id=event_id, establishment_id=establishment_id)
            exam.is_cancelled = True
            exam.save()
            return {"status": "success", "message": "Examen annulé."}

        elif event_type == 'SPECIFIC':
            detail = PlanningDetail.objects.get(id=event_id, planning__establishment_id=establishment_id)
            detail.is_cancelled = True
            detail.save()
            return {"status": "success", "message": "Cours ponctuel annulé."}

        elif event_type == 'GLOBAL':
            global_detail = PlanningDetail.objects.get(id=event_id, planning__establishment_id=establishment_id)
            
            # Pour annuler une instance de cours global, on crée une exception (Planning Spécifique)
            # 1. On cherche ou on crée un Planning "Exception"
            exception_planning, created = Planning.objects.get_or_create(
                nom=f"Exception {target_date}",
                establishment_id=establishment_id,
                date_start=target_date_obj,
                date_end=target_date_obj,
                is_specific=True,
                defaults={'is_global': False, 'is_conge': False}
            )

            # 2. On crée le détail annulé qui va masquer le cours global
            new_detail = PlanningDetail.objects.create(
                planning=exception_planning,
                date=target_date_obj,
                heure_debut=global_detail.heure_debut,
                heure_fin=global_detail.heure_fin,
                matiere_id=global_detail.matiere_id,
                enseignant_id=global_detail.enseignant_id,
                classe_id=global_detail.classe_id,
                salle_id=global_detail.salle_id,
                is_cancelled=True,
                establishment_id=establishment_id
            )
            
            return {"status": "success", "message": "Exception créée pour le cours global."}

        else:
            raise ValueError(f"Type d'événement inconnu : {event_type}")

    def reschedule_event(self, event_id, original_date, new_date, event_type, establishment_id, user_id=None, new_start_time=None, new_end_time=None, new_room_id=None):
        """
        Reporte un événement à une nouvelle date et potentiellement un nouvel horaire ou salle.
        """
        original_date_obj = datetime.strptime(original_date, '%Y-%m-%d').date()
        new_date_obj = datetime.strptime(new_date, '%Y-%m-%d').date()
        
        start_time_obj = None
        end_time_obj = None
        if new_start_time:
            # Gère HH:MM ou HH:MM:SS
            start_time_obj = datetime.strptime(new_start_time[:5], '%H:%M').time()
        if new_end_time:
            end_time_obj = datetime.strptime(new_end_time[:5], '%H:%M').time()

        # Calculer les heures effectives pour la vérification de conflits
        if event_type == 'EXAM':
            exam = EvaluationPlanning.objects.get(id=event_id, establishment_id=establishment_id)
            final_start_time = start_time_obj if start_time_obj else exam.start_time
            if end_time_obj:
                final_end_time = end_time_obj
            else:
                from datetime import timedelta
                start_dt = datetime.combine(new_date_obj, final_start_time)
                final_end_time = (start_dt + timedelta(minutes=exam.duration_minutes)).time()
        else:
            detail = PlanningDetail.objects.get(id=event_id, planning__establishment_id=establishment_id)
            final_start_time = start_time_obj if start_time_obj else detail.heure_debut
            final_end_time = end_time_obj if end_time_obj else detail.heure_fin

        # Vérification des conflits
        conflict_error = self._check_conflicts(event_id, event_type, new_date_obj, final_start_time, final_end_time, establishment_id, new_room_id)
        if conflict_error:
            raise ValueError(conflict_error)

        if event_type == 'EXAM':
            exam = EvaluationPlanning.objects.get(id=event_id, establishment_id=establishment_id)
            exam.is_cancelled = True
            exam.rescheduled_to = new_date_obj
            exam.save()
            
            duration = exam.duration_minutes
            if start_time_obj and end_time_obj:
                start_dt = datetime.combine(new_date_obj, start_time_obj)
                end_dt = datetime.combine(new_date_obj, end_time_obj)
                duration = int((end_dt - start_dt).total_seconds() / 60)
                
            # Créer une copie pour la nouvelle date
            new_exam = EvaluationPlanning.objects.create(
                evaluation_subject=exam.evaluation_subject,
                date=new_date_obj,
                start_time=start_time_obj if start_time_obj else exam.start_time,
                duration_minutes=duration,
                establishment_id=exam.establishment_id,
                is_cancelled=False
            )
            # Copier les relations M2M
            new_exam.levels.set(exam.levels.all())
            new_exam.classrooms.set(exam.classrooms.all())
            if new_room_id:
                new_exam.rooms.set([new_room_id])
            else:
                new_exam.rooms.set(exam.rooms.all())
            
            return {"status": "success", "message": "Examen reporté."}

        elif event_type == 'SPECIFIC':
            detail = PlanningDetail.objects.get(id=event_id, planning__establishment_id=establishment_id)
            
            # Marquer l'ancien comme annulé/reporté
            detail.is_cancelled = True
            detail.rescheduled_to = new_date_obj
            detail.save()
            
            # Créer un nouveau cours spécifique à la nouvelle date
            new_detail = PlanningDetail.objects.create(
                planning=detail.planning,
                date=new_date_obj,
                heure_debut=start_time_obj if start_time_obj else detail.heure_debut,
                heure_fin=end_time_obj if end_time_obj else detail.heure_fin,
                matiere_id=detail.matiere_id,
                enseignant_id=detail.enseignant_id,
                classe_id=detail.classe_id,
                salle_id=new_room_id if new_room_id else detail.salle_id,
                is_cancelled=False,
                establishment_id=establishment_id
            )

            # Si le report sort des limites du planning parent, on met à jour les limites
            parent = detail.planning
            if new_date_obj < parent.date_start:
                parent.date_start = new_date_obj
                parent.save()
            elif new_date_obj > parent.date_end:
                parent.date_end = new_date_obj
                parent.save()
                
            return {"status": "success", "message": "Cours ponctuel reporté."}

        elif event_type == 'GLOBAL':
            global_detail = PlanningDetail.objects.get(id=event_id, planning__establishment_id=establishment_id)
            
            # 1. On crée l'exception (cours annulé/reporté) à la date d'origine
            exception_planning, _ = Planning.objects.get_or_create(
                nom=f"Exception {original_date}",
                establishment_id=establishment_id,
                date_start=original_date_obj,
                date_end=original_date_obj,
                is_specific=True,
                defaults={'is_global': False, 'is_conge': False}
            )

            PlanningDetail.objects.create(
                planning=exception_planning,
                date=original_date_obj,
                heure_debut=global_detail.heure_debut,
                heure_fin=global_detail.heure_fin,
                matiere_id=global_detail.matiere_id,
                enseignant_id=global_detail.enseignant_id,
                classe_id=global_detail.classe_id,
                salle_id=global_detail.salle_id,
                is_cancelled=True,
                rescheduled_to=new_date_obj,
                establishment_id=establishment_id
            )
            
            # 2. On crée le nouveau cours à la nouvelle date
            reschedule_planning, _ = Planning.objects.get_or_create(
                nom=f"Report du {original_date} au {new_date}",
                establishment_id=establishment_id,
                date_start=new_date_obj,
                date_end=new_date_obj,
                is_specific=True,
                defaults={'is_global': False, 'is_conge': False}
            )

            new_detail = PlanningDetail.objects.create(
                planning=reschedule_planning,
                date=new_date_obj,
                heure_debut=start_time_obj if start_time_obj else global_detail.heure_debut,
                heure_fin=end_time_obj if end_time_obj else global_detail.heure_fin,
                matiere_id=global_detail.matiere_id,
                enseignant_id=global_detail.enseignant_id,
                classe_id=global_detail.classe_id,
                salle_id=new_room_id if new_room_id else global_detail.salle_id,
                is_cancelled=False,
                establishment_id=establishment_id
            )
            
            return {"status": "success", "message": "Cours global reporté via création d'exceptions."}
        else:
            raise ValueError(f"Type d'événement inconnu : {event_type}")
