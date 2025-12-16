from django.db.models import QuerySet

def get_context_filtered_queryset(model, info, order_by=None):
    """
    Retourne un queryset filtré par l'établissement du contexte (si applicable).
    Gère automatiquement :
    1. L'instanciation (objects.all())
    2. Le filtre establishment_id (si modèle lié)
    3. Le tri (optionnel)
    """
    queryset = model.objects.all()

    # Filtrage par Etablissement (Context awareness)
    est_id = getattr(info.context, 'establishment_id', None)
    print(f"[DEBUG] get_context_filtered_queryset - Model: {model.__name__}, Est ID: {est_id}")
    
    if est_id:
        if hasattr(model, 'establishment'):
            queryset = queryset.filter(establishment_id=est_id)
            print(f"[DEBUG] Filtered {model.__name__} by establishment_id={est_id}. Count: {queryset.count()}")
        elif hasattr(model, 'est_id'): # Au cas où
             queryset = queryset.filter(est_id=est_id)
    else:
        print(f"[DEBUG] No establishment_id in context. Returning full queryset for {model.__name__}")

    # Tri
    if order_by:
        queryset = queryset.order_by(order_by)

    return queryset
