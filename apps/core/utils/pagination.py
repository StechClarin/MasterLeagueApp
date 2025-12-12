from django.core.paginator import Paginator

def paginate_queryset(queryset, page, page_size):
    """
    Paginate a queryset and return specific pagination data structure.
    """
    paginator = Paginator(queryset, page_size)
    try:
        page_obj = paginator.page(page)
    except:
        page_obj = paginator.page(1)
        
    return {
        'items': page_obj.object_list,
        'total_count': paginator.count,
        'num_pages': paginator.num_pages,
        'current_page': page_obj.number,
        'page_size': page_size
    }
