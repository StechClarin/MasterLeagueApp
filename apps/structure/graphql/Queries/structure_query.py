import graphene
from ..Types.structure_response_type import StructureResponseType
from ...services.structure_service import StructureService

class StructureQuery(graphene.ObjectType):
    active_structure = graphene.Field(StructureResponseType)

    def resolve_active_structure(root, info):
        # 1. Priorité au contexte (Header X-Establishment-ID)
        est_id = getattr(info.context, 'establishment_id', None)
        establishment = None

        if est_id:
            from apps.core.models.establishment import Establishment
            try:
                establishment = Establishment.objects.get(pk=est_id)
            except Establishment.DoesNotExist:
                pass

        # 2. Fallback sur l'établissement de l'utilisateur
        if not establishment:
            user = info.context.user
            if not user.is_authenticated:
                return None
            
            establishment = getattr(user, 'establishment', None)
            
            # Fallback dev/test (A supprimer en prod ?)
            # if not establishment:
            #    from apps.core.models.establishment import Establishment
            #    establishment = Establishment.objects.first()

        if not establishment:
            return None

        service = StructureService()
        return service.get_active_structure(establishment)
