import graphene

class EvolutionPointType(graphene.ObjectType):
    label = graphene.String()
    value = graphene.Float()

class DistributionPointType(graphene.ObjectType):
    category = graphene.String()
    count = graphene.Float() # Changed to Float to support amounts as well

class StudentPerformanceType(graphene.ObjectType):
    student_name = graphene.String()
    average_grade = graphene.Float()
    matricule = graphene.String()

class RecentPaymentType(graphene.ObjectType):
    id = graphene.String() # UUID as string
    student_name = graphene.String()
    amount = graphene.Float()
    payment_method = graphene.String()
    payment_date = graphene.String()

class RecentEnrollmentType(graphene.ObjectType):
    id = graphene.String() # UUID as string
    student_name = graphene.String()
    classroom_name = graphene.String()
    enrollment_date = graphene.String()
    status = graphene.String()

class DashboardType(graphene.ObjectType):
    total_students = graphene.Int()
    total_staff = graphene.Int()
    total_classrooms = graphene.Int()
    total_active_evaluations = graphene.Int()
    average_grade = graphene.Float()
    
    # Finance
    total_revenue = graphene.Float()
    total_pending = graphene.Float()
    recovery_rate = graphene.Float()
    total_teachers = graphene.Int()
    
    grade_evolution = graphene.List(EvolutionPointType)
    student_distribution = graphene.List(DistributionPointType)
    revenue_evolution = graphene.List(EvolutionPointType)
    payment_methods_distribution = graphene.List(DistributionPointType)
    top_students = graphene.List(StudentPerformanceType)
    student_gender_distribution = graphene.List(DistributionPointType)
    recent_payments = graphene.List(RecentPaymentType)
    recent_enrollments = graphene.List(RecentEnrollmentType)
    subject_grades_distribution = graphene.List(DistributionPointType)
    invoice_status_distribution = graphene.List(DistributionPointType)
    staff_contract_distribution = graphene.List(DistributionPointType)
    enrollment_evolution = graphene.List(EvolutionPointType)

