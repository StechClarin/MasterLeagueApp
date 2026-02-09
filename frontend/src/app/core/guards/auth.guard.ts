import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Vérification simple basée sur le signal ou la présence du token
    if (authService.currentUserSignal() || localStorage.getItem('access_token')) {
        return true;
    }

    // Si pas connecté, redirection vers login
    return router.createUrlTree(['/login']);
};
