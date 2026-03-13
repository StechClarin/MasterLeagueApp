import graphene

class EvolutionPointType(graphene.ObjectType):
    label = graphene.String()
    value = graphene.Float()

class DistributionPointType(graphene.ObjectType):
    category = graphene.String()
    count = graphene.Int()

class DashboardType(graphene.ObjectType):
    total_students = graphene.Int()
    total_staff = graphene.Int()
    total_classrooms = graphene.Int()
    total_active_evaluations = graphene.Int()
    average_grade = graphene.Float()
    
    grade_evolution = graphene.List(EvolutionPointType)
    student_distribution = graphene.List(DistributionPointType)
