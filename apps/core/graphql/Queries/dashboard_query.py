import strawberry

@strawberry.type
class ChartDataItem:
    label: str
    value: float

@strawberry.type
class CategoryCountItem:
    category: str
    count: int

@strawberry.type
class TopStudentItem:
    student_name: str
    average_grade: float
    matricule: str

@strawberry.type
class DashboardDataType:
    total_students: int
    total_staff: int
    total_classrooms: int
    total_active_evaluations: int
    average_grade: float
    total_revenue: float
    total_pending: float
    grade_evolution: list[ChartDataItem]
    student_distribution: list[CategoryCountItem]
    revenue_evolution: list[ChartDataItem]
    payment_methods_distribution: list[CategoryCountItem]
    top_students: list[TopStudentItem]

@strawberry.type
class DashboardQuery:
    @strawberry.field
    def dashboard_data(self) -> DashboardDataType:
        return DashboardDataType(
            total_students=0,
            total_staff=0,
            total_classrooms=0,
            total_active_evaluations=0,
            average_grade=0.0,
            total_revenue=0.0,
            total_pending=0.0,
            grade_evolution=[],
            student_distribution=[],
            revenue_evolution=[],
            payment_methods_distribution=[],
            top_students=[]
        )
