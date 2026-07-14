import graphene
from ..Types.academic_year_type import AcademicYearType
from apps.structure.models.academic_year import AcademicYear
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from apps.core.graphql.utils.queryset_filter import get_context_filtered_queryset

class AcademicYearQuery(graphene.ObjectType):
    academicyear = graphene.Field(AcademicYearType, id=graphene.ID(required=True))
    academicyears = graphene.Field(
        get_paginated_type(AcademicYearType),
        search=graphene.String(),
        is_active=graphene.Boolean(),
        is_archived=graphene.Boolean(),
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_academicyear(root, info, id):
        try:
            return AcademicYear.objects.get(pk=id)
        except AcademicYear.DoesNotExist:
            return None

    def resolve_academicyears(root, info, search=None, page=1, page_size=10, **kwargs):
        est_id = getattr(info.context, 'establishment_id', None)
        if est_id:
            from datetime import date, timedelta
            today = date.today()
            
            # 1. 20 jours après la date de fin, l'année active passe en statut d'archive
            archivable_years = AcademicYear.objects.filter(
                establishment_id=est_id,
                is_active=True,
                end_date__lt=today - timedelta(days=20)
            )
            for year in archivable_years:
                year.is_active = False
                year.is_archived = True
                year.save()
                print(f"[AUTO-ARCHIVE] AcademicYear {year.name} (id: {year.id}) has been archived.")

            # 2. Par défaut, l'année active est l'année courante si aucune active
            has_active = AcademicYear.objects.filter(
                establishment_id=est_id,
                is_active=True
            ).exists()
            
            if not has_active:
                current_year = AcademicYear.objects.filter(
                    establishment_id=est_id,
                    start_date__lte=today,
                    end_date__gte=today,
                    is_archived=False
                ).first()
                if current_year:
                    current_year.is_active = True
                    current_year.save()
                    print(f"[AUTO-ACTIVATE] AcademicYear {current_year.name} (id: {current_year.id}) has been set active as current calendar year.")

        queryset = get_context_filtered_queryset(AcademicYear, info, order_by='-start_date')
        
        if search:
            queryset = queryset.filter(name__icontains=search)

        is_active = kwargs.get('is_active')
        if is_active is not None:
             queryset = queryset.filter(is_active=is_active)

        is_archived = kwargs.get('is_archived')
        if is_archived is not None:
             queryset = queryset.filter(is_archived=is_archived)
            
        return paginate_queryset(queryset, page, page_size)
