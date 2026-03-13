import graphene
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.student_type import StudentType
from ...models import Student

StudentPaginatedType = get_paginated_type(StudentType)

class StudentQuery(graphene.ObjectType):
    student = graphene.Field(StudentType, id=graphene.ID(required=True))
    students = graphene.Field(
        StudentPaginatedType,
        search=graphene.String(),
        classroom_id=graphene.ID(),
        academic_year_id=graphene.ID(),
        status=graphene.String(),
        parent_phone=graphene.String(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_student(root, info, id):
        try:
            return Student.objects.get(pk=id)
        except Student.DoesNotExist:
            return None

    def resolve_students(root, info, search=None, classroom_id=None, academic_year_id=None, status=None, parent_phone=None, page=1, page_size=10, **kwargs):
        from django.db.models import Q
        
        # 1. Base Query with optimization
        queryset = Student.objects.select_related('establishment', 'health').prefetch_related(
            'enrollments', 
            'enrollments__classroom', 
            'enrollments__academic_year',
            'guardians'
        ).order_by('-created_at')

        # 2. Context Filtering (Establishment)
        if hasattr(info.context, 'establishment_id') and info.context.establishment_id:
             queryset = queryset.filter(establishment_id=info.context.establishment_id)

        # 3. Filters
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) | 
                Q(last_name__icontains=search) | 
                Q(matricule__icontains=search)
            )
            
        if classroom_id:
            # Filter by current/any enrollment in this classroom
            queryset = queryset.filter(enrollments__classroom_id=classroom_id, enrollments__is_active=True)

        if academic_year_id:
            queryset = queryset.filter(enrollments__academic_year_id=academic_year_id, enrollments__is_active=True)

        if status:
            queryset = queryset.filter(enrollments__status=status, enrollments__is_active=True)

        if parent_phone:
            queryset = queryset.filter(guardians__phone_number__icontains=parent_phone)

        # 4. Distinct (Important because of M2M joins in filters)
        queryset = queryset.distinct()

        paginated_data = paginate_queryset(queryset, page, page_size)
        return StudentPaginatedType(**paginated_data)
