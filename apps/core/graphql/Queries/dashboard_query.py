import graphene
from django.db.models import Avg, Count, Sum, Q
from django.db.models.functions import TruncMonth

# Importer les modèles nécessaires
from apps.students.models import Student, Enrollment
from apps.hr.models.personnel import Personnel
from apps.structure.models import ClassRoom, AcademicYear
from apps.evaluations.models import Grade, EvaluationSession
from apps.finance.models import Invoice, Payment
from django.db.models.functions import TruncMonth
from apps.core.graphql.Types.dashboard_type import (
    DashboardType, EvolutionPointType, DistributionPointType, StudentPerformanceType,
    RecentPaymentType, RecentEnrollmentType
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
                total_revenue=0, total_pending=0, recovery_rate=0.0, total_teachers=0,
                grade_evolution=[], student_distribution=[],
                revenue_evolution=[], payment_methods_distribution=[],
                top_students=[], student_gender_distribution=[],
                recent_payments=[], recent_enrollments=[],
                subject_grades_distribution=[], invoice_status_distribution=[],
                staff_contract_distribution=[], enrollment_evolution=[]
            )
            
        # 1. Total Counts
        total_students = Student.objects.filter(establishment_id=est_id).count()
        total_staff = Personnel.objects.filter(establishment_id=est_id).count()
        total_classrooms = ClassRoom.objects.filter(establishment_id=est_id).count()
        total_active_evaluations = EvaluationSession.objects.filter(
            establishment_id=est_id, status='IN_PROGRESS'
        ).count()
        
        # 1b. Total Teachers
        total_teachers = Personnel.objects.filter(
            establishment_id=est_id,
            is_active=True
        ).filter(
            Q(roles__name__iexact="ENSEIGNANT") |
            Q(job_title__icontains="enseignant") |
            Q(job_title__icontains="professeur") |
            Q(job_title__icontains="prof")
        ).distinct().count()
        
        # 2. Finance Stats
        finance_stats = Invoice.objects.filter(establishment_id=est_id).aggregate(
            total_paid=Sum('paid_amount'),
            total_global=Sum('total_amount')
        )
        total_revenue = float(finance_stats['total_paid'] or 0)
        total_pending = float((finance_stats['total_global'] or 0) - (finance_stats['total_paid'] or 0))
        total_invoiced = float(finance_stats['total_global'] or 0)
        recovery_rate = round((total_revenue / total_invoiced) * 100, 2) if total_invoiced > 0 else 0.0

        # 3. Academic Stats
        avg_grade = Grade.objects.filter(establishment_id=est_id).aggregate(Avg('value'))['value__avg'] or 0.0
        
        # 4. Evolution des notes
        active_year = AcademicYear.objects.filter(establishment_id=est_id, is_active=True).first()
        
        evolution_data = Grade.objects.filter(
            establishment_id=est_id,
            evaluation_subject__session__academic_period__academic_year=active_year
        ).values(
            'evaluation_subject__session__academic_period__name',
            'evaluation_subject__session__academic_period__start_date'
        ).annotate(avg=Avg('value')).order_by('evaluation_subject__session__academic_period__start_date')
        
        grade_evolution = [
            EvolutionPointType(label=item['evaluation_subject__session__academic_period__name'] or 'N/A', value=round(item['avg'], 2))
            for item in evolution_data if item['avg'] is not None
        ]
        
        # 5. Distribution des élèves par Classe
        distribution_data = Enrollment.objects.filter(
            establishment_id=est_id, academic_year=active_year, status='REGISTERED'
        ).values('classroom__name').annotate(count=Count('id')).order_by('-count')[:5]
        
        student_distribution = [
            DistributionPointType(category=item['classroom__name'] or 'Classe Inconnue', count=float(item['count']))
            for item in distribution_data
        ]

        # 5b. Distribution par genre
        gender_data = Student.objects.filter(establishment_id=est_id).values('gender').annotate(count=Count('id'))
        gender_map = {'M': 'Masculin', 'F': 'Féminin'}
        student_gender_distribution = [
            DistributionPointType(category=gender_map.get(item['gender'], 'Inconnu'), count=float(item['count']))
            for item in gender_data
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

        # 8. Top Students (issu du dernier examen fait)
        last_exam_session = EvaluationSession.objects.filter(
            establishment_id=est_id,
            evaluation_type__code='EXAM'
        ).order_by('-academic_period__start_date', '-created_at').first()

        if last_exam_session:
            top_students_data = Grade.objects.filter(
                establishment_id=est_id,
                student__isnull=False,
                evaluation_subject__session=last_exam_session
            ).values(
                'student__first_name', 'student__last_name', 'student__matricule'
            ).annotate(avg=Avg('value')).filter(avg__isnull=False).order_by('-avg')[:5]
        else:
            top_students_data = []
        
        top_students = [
            StudentPerformanceType(
                student_name=f"{item['student__first_name'] or ''} {item['student__last_name'] or ''}".strip() or "Élève sans nom",
                average_grade=round(item['avg'], 2) if item['avg'] is not None else 0.0,
                matricule=item['student__matricule']
            ) for item in top_students_data
        ]

        # 9. Derniers paiements
        recent_payments_qs = Payment.objects.filter(
            establishment_id=est_id
        ).select_related('invoice__student').order_by('-created_at')[:5]
        
        recent_payments = [
            RecentPaymentType(
                id=str(p.id),
                student_name=f"{p.invoice.student.first_name} {p.invoice.student.last_name}".strip(),
                amount=float(p.amount),
                payment_method=p.payment_method,
                payment_date=p.created_at.strftime('%Y-%m-%d %H:%M:%S') if p.created_at else ''
            )
            for p in recent_payments_qs
        ]

        # 10. Dernières inscriptions
        recent_enrollments_qs = Enrollment.objects.filter(
            establishment_id=est_id
        ).select_related('student', 'classroom').order_by('-created_at')[:5]
        
        recent_enrollments = [
            RecentEnrollmentType(
                id=str(e.id),
                student_name=f"{e.student.first_name} {e.student.last_name}".strip(),
                classroom_name=e.classroom.name,
                enrollment_date=e.created_at.strftime('%Y-%m-%d %H:%M:%S') if e.created_at else '',
                status=e.status
            )
            for e in recent_enrollments_qs
        ]

        # 11. Moyenne par matière
        subject_data = Grade.objects.filter(
            establishment_id=est_id,
            value__isnull=False
        ).values('evaluation_subject__subject__name').annotate(avg=Avg('value')).order_by('-avg')[:6]
        
        subject_grades_distribution = [
            DistributionPointType(category=item['evaluation_subject__subject__name'] or 'Matière Inconnue', count=round(float(item['avg']), 2))
            for item in subject_data
        ]

        # 12. Statut des factures
        invoice_status_data = Invoice.objects.filter(
            establishment_id=est_id
        ).values('status').annotate(count=Count('id'))
        
        status_map = {
            'UNPAID': 'Impayés',
            'PARTIAL': 'Partiels',
            'PAID': 'Payés',
            'CANCELLED': 'Annulés'
        }
        invoice_status_distribution = [
            DistributionPointType(category=status_map.get(item['status'], item['status']), count=float(item['count']))
            for item in invoice_status_data
        ]

        # 13. Contrats RH
        contract_data = Personnel.objects.filter(
            establishment_id=est_id,
            is_active=True,
            contract_type__isnull=False
        ).values('contract_type__designation').annotate(count=Count('id')).order_by('-count')
        
        staff_contract_distribution = [
            DistributionPointType(category=item['contract_type__designation'] or 'Sans Contrat', count=float(item['count']))
            for item in contract_data
        ]

        # 14. Évolution mensuelle des inscriptions
        enrollment_evol_qs = Enrollment.objects.filter(
            establishment_id=est_id,
            status='REGISTERED'
        ).annotate(
            month=TruncMonth('enrollment_date')
        ).values('month').annotate(total=Count('id')).order_by('month')
        
        enrollment_evolution = [
            EvolutionPointType(label=item['month'].strftime('%b %Y') if item['month'] else 'N/A', value=float(item['total']))
            for item in enrollment_evol_qs
        ]
        
        return DashboardType(
            total_students=total_students,
            total_staff=total_staff,
            total_classrooms=total_classrooms,
            total_active_evaluations=total_active_evaluations,
            average_grade=round(avg_grade, 2),
            total_revenue=total_revenue,
            total_pending=total_pending,
            recovery_rate=recovery_rate,
            total_teachers=total_teachers,
            grade_evolution=grade_evolution,
            student_distribution=student_distribution,
            revenue_evolution=revenue_evolution,
            payment_methods_distribution=payment_methods_distribution,
            top_students=top_students,
            student_gender_distribution=student_gender_distribution,
            recent_payments=recent_payments,
            recent_enrollments=recent_enrollments,
            subject_grades_distribution=subject_grades_distribution,
            invoice_status_distribution=invoice_status_distribution,
            staff_contract_distribution=staff_contract_distribution,
            enrollment_evolution=enrollment_evolution
        )
