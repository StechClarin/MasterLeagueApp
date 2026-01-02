import graphene
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
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_enrollment(root, info, id):
        try:
            return Enrollment.objects.get(pk=id)
        except Enrollment.DoesNotExist:
            return None

    def resolve_enrollments(root, info, search=None, page=1, page_size=10, **kwargs):
        queryset = Enrollment.objects.all().order_by('-created_at')

        if search:
            queryset = queryset.filter(name__icontains=search)

        paginated_data = paginate_queryset(queryset, page, page_size)
        return EnrollmentPaginatedType(**paginated_data)
