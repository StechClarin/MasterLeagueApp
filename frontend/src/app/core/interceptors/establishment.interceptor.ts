import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StructureStateService } from '../services/structure-state.service';

export const establishmentInterceptor: HttpInterceptorFn = (req, next) => {
    const structureState = inject(StructureStateService);
    const currentEstId = structureState.currentEstablishmentId();

    // Ne pas injecter le header pour les requêtes d'authentification
    if (req.url.includes('/api/auth/')) {
        return next(req);
    }

    if (currentEstId) {
        console.log('[Interceptor] Injection Header X-Establishment-ID:', currentEstId);
        const clonedReq = req.clone({
            headers: req.headers.set('X-Establishment-ID', currentEstId)
        });
        return next(clonedReq);
    }

    return next(req);
};
