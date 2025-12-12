import graphene

def get_paginated_type(graphene_type, type_name=None):
    """
    Factory function to create a PaginatedType for a specific Graphene Type.
    """
    if not type_name:
        type_name = f"{graphene_type._meta.name}Paginated"

    class PaginatedType(graphene.ObjectType):
        items = graphene.List(graphene_type)
        total_count = graphene.Int()
        num_pages = graphene.Int()
        current_page = graphene.Int()
        page_size = graphene.Int()
        
        class Meta:
            name = type_name

    return PaginatedType
