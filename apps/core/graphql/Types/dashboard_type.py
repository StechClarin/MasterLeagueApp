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

class DashboardType(graphene.ObjectType):
    total_students = graphene.Int()
    total_staff = graphene.Int()
    total_classrooms = graphene.Int()
    total_active_evaluations = graphene.Int()
    average_grade = graphene.Float()
    
    # Finance
    total_revenue = graphene.Float()
    total_pending = graphene.Float()
    
    grade_evolution = graphene.List(EvolutionPointType)
    student_distribution = graphene.List(DistributionPointType)
    revenue_evolution = graphene.List(EvolutionPointType)
    payment_methods_distribution = graphene.List(DistributionPointType)
    top_students = graphene.List(StudentPerformanceType)
