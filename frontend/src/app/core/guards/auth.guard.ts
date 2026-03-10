import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Vérification basée sur le signal (qui gère maintenant l'expiration via hasToken())
    if (authService.currentUserSignal()) {
        return true;
    }

    // Si pas connecté, redirection vers login
    return router.createUrlTree(['/login']);
};
