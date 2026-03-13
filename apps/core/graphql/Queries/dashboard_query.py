import graphene
from django.db.models import Avg, Count
from apps.core.graphql.Types.dashboard_type import DashboardType, EvolutionPointType, DistributionPointType

# Importer les modèles nécessaires
from apps.students.models import Student, Enrollment
from apps.hr.models.personnel import Personnel
from apps.structure.models import ClassRoom, AcademicYear
from apps.evaluations.models import Grade, EvaluationSession

class DashboardQuery(graphene.ObjectType):
    dashboard_data = graphene.Field(DashboardType)

    def resolve_dashboard_data(self, info):
        # On récupère l'ID via le middleware EstablishmentMiddleware
        est_id = getattr(info.context, 'establishment_id', None)
        
        if not est_id:
            # Si pas d'établissement dans le contexte, on retourne un dashboard vide
            # au lieu de planter ou de renvoyer des données agrégées (scurit)
            return DashboardType(
                total_students=0,
                total_staff=0,
                total_classrooms=0,
                total_active_evaluations=0,
                average_grade=0,
                grade_evolution=[],
                student_distribution=[]
            )
            
        # 1. Total Counts (Filtres directs sur establishment_id via EstablishmentAwareModel)
        total_students = Student.objects.filter(establishment_id=est_id).count()
        total_staff = Personnel.objects.filter(establishment_id=est_id).count()
        total_classrooms = ClassRoom.objects.filter(establishment_id=est_id).count()
        total_active_evaluations = EvaluationSession.objects.filter(
            establishment_id=est_id, 
            status='IN_PROGRESS'
        ).count()
        
        # 2. Global Average (Utilisation directe du champ establishment de Grade)
        avg_grade = Grade.objects.filter(
            establishment_id=est_id
        ).aggregate(Avg('value'))['value__avg'] or 0.0
        
        # 3. Evolution des notes (par Période)
        evolution_data = Grade.objects.filter(
            establishment_id=est_id
        ).values(
            'evaluation_subject__session__academic_period__name'
        ).annotate(
            avg=Avg('value')
        ).order_by('evaluation_subject__session__academic_period__id')
        
        grade_evolution = [
            EvolutionPointType(label=item['evaluation_subject__session__academic_period__name'] or 'N/A', value=round(item['avg'], 2))
            for item in evolution_data if item['avg'] is not None
        ]
        
        # 4. Distribution des élèves par Classe (Année Active uniquement)
        active_year = AcademicYear.objects.filter(establishment_id=est_id, is_active=True).first()
        
        distribution_data = Enrollment.objects.filter(
            establishment_id=est_id,
            academic_year=active_year,
            status='REGISTERED'
        ).values('classroom__name').annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        student_distribution = [
            DistributionPointType(category=item['classroom__name'] or 'Classe Inconnue', count=item['count'])
            for item in distribution_data
        ]
        
        return DashboardType(
            total_students=total_students,
            total_staff=total_staff,
            total_classrooms=total_classrooms,
            total_active_evaluations=total_active_evaluations,
            average_grade=round(avg_grade, 2),
            grade_evolution=grade_evolution,
            student_distribution=student_distribution
        )
