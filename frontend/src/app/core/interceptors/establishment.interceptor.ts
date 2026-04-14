import { HttpInterceptorFn } from '@angular/common/http';

export const establishmentInterceptor: HttpInterceptorFn = (req, next) => {
    // On lit directement le localStorage pour éviter une dépendance circulaire vers StructureStateService
    const currentEstId = localStorage.getItem('currentEstablishmentId');

    // Ne pas injecter le header pour les requêtes d'authentification ou si pas d'ID
    if (req.url.includes('/api/auth/') || !currentEstId) {
        return next(req);
    }

    // Injection du Header X-Establishment-ID
    console.log('[Interceptor] Injection Header X-Establishment-ID:', currentEstId);
    const clonedReq = req.clone({
        headers: req.headers.set('X-Establishment-ID', currentEstId)
    });
    
    return next(clonedReq);
};
