import graphene
from django.db.models import Avg, Count, Sum
from django.db.models.functions import TruncMonth

# Importer les modèles nécessaires
from apps.students.models import Student, Enrollment
from apps.hr.models.personnel import Personnel
from apps.structure.models import ClassRoom, AcademicYear
from apps.evaluations.models import Grade, EvaluationSession
from apps.finance.models import Invoice, Payment
from django.db.models.functions import TruncMonth
from apps.core.graphql.Types.dashboard_type import (
    DashboardType, EvolutionPointType, DistributionPointType, StudentPerformanceType
)

class DashboardQuery(graphene.ObjectType):
    dashboard_data = graphene.Field(DashboardType)

    def resolve_dashboard_data(self, info):
        # On récupère l'ID via le middleware EstablishmentMiddleware
        est_id = getattr(info.context, 'establishment_id', None)
        
        if not est_id:
            return DashboardType(
                total_students=0, total_staff=0, total_classrooms=0,
                total_active_evaluations=0, average_grade=0,
                total_revenue=0, total_pending=0,
                grade_evolution=[], student_distribution=[],
                revenue_evolution=[], payment_methods_distribution=[],
                top_students=[]
            )
            
        # 1. Total Counts
        total_students = Student.objects.filter(establishment_id=est_id).count()
        total_staff = Personnel.objects.filter(establishment_id=est_id).count()
        total_classrooms = ClassRoom.objects.filter(establishment_id=est_id).count()
        total_active_evaluations = EvaluationSession.objects.filter(
            establishment_id=est_id, status='IN_PROGRESS'
        ).count()
        
        # 2. Finance Stats
        finance_stats = Invoice.objects.filter(establishment_id=est_id).aggregate(
            total_paid=Sum('paid_amount'),
            total_global=Sum('total_amount')
        )
        total_revenue = float(finance_stats['total_paid'] or 0)
        total_pending = float((finance_stats['total_global'] or 0) - (finance_stats['total_paid'] or 0))

        # 3. Academic Stats
        avg_grade = Grade.objects.filter(establishment_id=est_id).aggregate(Avg('value'))['value__avg'] or 0.0
        
        # 4. Evolution des notes
        evolution_data = Grade.objects.filter(establishment_id=est_id).values(
            'evaluation_subject__session__academic_period__name'
        ).annotate(avg=Avg('value')).order_by('evaluation_subject__session__academic_period__id')
        
        grade_evolution = [
            EvolutionPointType(label=item['evaluation_subject__session__academic_period__name'] or 'N/A', value=round(item['avg'], 2))
            for item in evolution_data if item['avg'] is not None
        ]
        
        # 5. Distribution des élèves par Classe
        active_year = AcademicYear.objects.filter(establishment_id=est_id, is_active=True).first()
        distribution_data = Enrollment.objects.filter(
            establishment_id=est_id, academic_year=active_year, status='REGISTERED'
        ).values('classroom__name').annotate(count=Count('id')).order_by('-count')[:5]
        
        student_distribution = [
            DistributionPointType(category=item['classroom__name'] or 'Classe Inconnue', count=float(item['count']))
            for item in distribution_data
        ]

        # 6. Revenu mensuel (Evolution Finance)
        revenue_data = Payment.objects.filter(establishment_id=est_id).annotate(
            month=TruncMonth('payment_date')
        ).values('month').annotate(total=Sum('amount')).order_by('month')
        
        revenue_evolution = [
            EvolutionPointType(label=item['month'].strftime('%b %Y'), value=float(item['total']))
            for item in revenue_data
        ]

        # 7. Distribution par mode de paiement
        payment_dist = Payment.objects.filter(establishment_id=est_id).values('payment_method').annotate(
            total=Sum('amount')
        ).order_by('-total')
        
        payment_methods_distribution = [
            DistributionPointType(category=item['payment_method'], count=float(item['total']))
            for item in payment_dist
        ]

        # 8. Top Students
        top_students_data = Grade.objects.filter(
            establishment_id=est_id,
            student__isnull=False
        ).values(
            'student__first_name', 'student__last_name', 'student__matricule'
        ).annotate(avg=Avg('value')).filter(avg__isnull=False).order_by('-avg')[:5]
        
        top_students = [
            StudentPerformanceType(
                student_name=f"{item['student__first_name'] or ''} {item['student__last_name'] or ''}".strip() or "Élève sans nom",
                average_grade=round(item['avg'], 2) if item['avg'] is not None else 0.0,
                matricule=item['student__matricule']
            ) for item in top_students_data
        ]
        
        return DashboardType(
            total_students=total_students,
            total_staff=total_staff,
            total_classrooms=total_classrooms,
            total_active_evaluations=total_active_evaluations,
            average_grade=round(avg_grade, 2),
            total_revenue=total_revenue,
            total_pending=total_pending,
            grade_evolution=grade_evolution,
            student_distribution=student_distribution,
            revenue_evolution=revenue_evolution,
            payment_methods_distribution=payment_methods_distribution,
            top_students=top_students
        )
