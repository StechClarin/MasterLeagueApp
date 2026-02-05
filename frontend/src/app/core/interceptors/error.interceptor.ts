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

            if (error.error instanceof ErrorEvent) {
                // Erreur côté client
                errorMessage = `Erreur: ${error.error.message}`;
            } else {
                // Erreur côté serveur
                switch (error.status) {
                    case 401:
                        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
                        authService.logout();
                        router.navigate(['/auth/login']);
                        break;
                    case 403:
                        errorMessage = 'Accès refusé. Vous n\'avez pas les droits nécessaires.';
                        break;
                    case 404:
                        errorMessage = 'Ressource introuvable.';
                        break;
                    case 422:
                        // Souvent des erreurs de validation, gérées par les formulaires
                        // On peut ne pas afficher de toast générique si le formulaire le gère
                        return throwError(() => error);
                    case 500:
                        errorMessage = 'Erreur interne du serveur. Veuillez réessayer plus tard.';
                        break;
                    default:
                        errorMessage = `Erreur ${error.status}: ${error.message}`;
                }
            }

            // On affiche le toast pour les erreurs significatives
            if (error.status !== 422) {
                toastService.error(errorMessage);
            }

            return throwError(() => error);
        })
    );
};
