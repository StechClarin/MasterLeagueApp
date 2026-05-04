import graphene
from django.db import models
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ..Types.enrollment_type import EnrollmentType
from ...models import Enrollment

EnrollmentPaginatedType = get_paginated_type(EnrollmentType)

class EnrollmentQuery(graphene.ObjectType):
    enrollment = graphene.Field(EnrollmentType, id=graphene.ID(required=True))
    enrollments = graphene.Field(
        EnrollmentPaginatedType,
        search=graphene.String(),
        classroom_id=graphene.ID(),
        academic_year_id=graphene.ID(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_enrollment(root, info, id):
        try:
            queryset = Enrollment.objects.filter(pk=id, is_active=True)
            if hasattr(info.context, 'establishment_id') and info.context.establishment_id:
                queryset = queryset.filter(establishment_id=info.context.establishment_id)
            return queryset.get()
        except Enrollment.DoesNotExist:
            return None

    def resolve_enrollments(root, info, search=None, classroom_id=None, academic_year_id=None, page=1, page_size=10, **kwargs):
        queryset = Enrollment.objects.filter(is_active=True).order_by('-created_at')

        if hasattr(info.context, 'establishment_id') and info.context.establishment_id:
             queryset = queryset.filter(establishment_id=info.context.establishment_id)

        if search:
            queryset = queryset.filter(
                models.Q(student__first_name__icontains=search) |
                models.Q(student__last_name__icontains=search) |
                models.Q(student__registration_number__icontains=search)
            )
        
        if classroom_id:
            queryset = queryset.filter(classroom_id=classroom_id)
        
        if academic_year_id:
            queryset = queryset.filter(academic_year_id=academic_year_id)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return EnrollmentPaginatedType(**paginated_data)
