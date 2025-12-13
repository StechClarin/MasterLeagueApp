import graphene
from django.db.models import Q
from ..Types.personne_type import PersonneType
from apps.core.graphql.Types.paginated_type import get_paginated_type
from apps.core.utils.pagination import paginate_queryset
from ...models import Personne

PersonnePaginatedType = get_paginated_type(PersonneType)

class PersonneQuery(graphene.ObjectType):
    personne = graphene.Field(PersonneType, id=graphene.ID(required=True))
    personnes = graphene.Field(
        PersonnePaginatedType,
        search=graphene.String(), # Changed 'nom' to 'search' to be generic
        page=graphene.Int(default_value=1),
        page_size=graphene.Int(default_value=10)
    )

    def resolve_personne(root, info, id):
        try:
            return Personne.objects.get(pk=id)
        except Personne.DoesNotExist:
            return None

    def resolve_personnes(root, info, search=None, page=1, page_size=10, **kwargs):
        queryset = Personne.objects.all().order_by('-created_at')
        
        if search:
            queryset = queryset.filter(
                Q(nom__icontains=search) | 
                Q(prenom__icontains=search)
            )

        return PersonnePaginatedType(**paginate_queryset(queryset, page, page_size))
