def get_request_establishment_id(request):
    """
    Extrait l'ID de l'établissement à partir :
    1. Des en-têtes HTTP (X-Establishment-Id / X-Establishment-ID)
    2. Des paramètres d'URL (establishment_id)
    3. Du body JSON de la requête (establishment_id)
    """
    est_id = request.headers.get("X-Establishment-Id") or request.headers.get("X-Establishment-ID")
    if not est_id:
        est_id = request.query_params.get("establishment_id")
    if not est_id and hasattr(request, "data") and isinstance(request.data, dict):
        est_id = request.data.get("establishment_id")
    return est_id
