import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '@core/services/toast.service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const toastService = inject(ToastService);
    const router = inject(Router);
    const authService = inject(AuthService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'Une erreur inconnue est survenue';

            if (error.status === 0) {
                // Erreur réseau / CORS / Serveur éteint
                errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet ou si le serveur est en ligne.';
            } else if (error.error instanceof ErrorEvent) {
                // Erreur côté client pure (Angular)
                errorMessage = `Erreur Client: ${error.error.message}`;
            } else {
                // Erreur côté serveur
                switch (error.status) {
                    case 400:
                        // Bad Request (souvent règles métier ou validation non gérée par 422)
                        errorMessage = error.error?.detail || 'Requête invalide.';
                        break;
                    case 401:
                        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
                        authService.logout();
                        router.navigate(['/login']);
                        break;
                    case 403:
                        errorMessage = error.error?.detail || 'Accès refusé. Vous n\'avez pas les droits nécessaires.';
                        break;
                    case 404:
                        errorMessage = 'Ressource introuvable.';
                        break;
                    case 422:
                        // Erreurs de validation (souvent gérées par les formulaires)
                        // On retourne l'erreur brute pour que le composant la traite
                        return throwError(() => error);
                    case 500:
                        errorMessage = 'Erreur interne du serveur. Veuillez réessayer plus tard.';
                        break;
                    default:
                        // Cas par défaut : on essaie d'afficher le message du backend s'il existe
                        errorMessage = error.error?.detail || error.message || `Erreur ${error.status}`;
                }
            }

            // On affiche le toast pour les erreurs significatives
            // On évite d'afficher un toast générique si c'est une erreur de validation 400 (qui sera gérée par le composant de formulaire)
            const isValidationError400 = error.status === 400 && error.error && typeof error.error === 'object' && !error.error.detail;

            if (error.status !== 422 && !isValidationError400) {
                toastService.error(errorMessage);
            }

            return throwError(() => error);
        })
    );
};
