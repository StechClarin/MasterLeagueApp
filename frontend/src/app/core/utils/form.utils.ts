import { FormGroup } from '@angular/forms';

export class FormUtils {
    /**
     * Extrait un message d'erreur lisible depuis une réponse d'erreur Backend (DRF).
     * @param err L'objet erreur retourné par le HttpClient
     * @returns Le message d'erreur formaté
     */
    static getError(err: any): string {
        if (!err || !err.error) {
            return "Erreur réseau ou serveur.";
        }

        const errorData = err.error;

        // 1. Erreurs globales (non liées à un champ spécifique)
        if (errorData.non_field_errors) {
            return Array.isArray(errorData.non_field_errors)
                ? errorData.non_field_errors.join(' ')
                : errorData.non_field_errors;
        }

        // 2. Erreur générique DRF (ex: Permission denied)
        if (errorData.detail) {
            return errorData.detail;
        }

        // 3. Erreurs de champs (ex: {"email": ["Invalide"]})
        // On prend la première clé d'erreur trouvée pour l'afficher
        const firstErrorKey = Object.keys(errorData)[0];
        if (firstErrorKey) {
            const fieldError = errorData[firstErrorKey];
            const message = Array.isArray(fieldError) ? fieldError.join(' ') : fieldError;
            // On capitalise la première lettre de la clé pour faire propre
            const fieldName = firstErrorKey.charAt(0).toUpperCase() + firstErrorKey.slice(1);
            return `${fieldName}: ${message}`;
        }

        return "Une erreur inconnue est survenue.";
    }
    /**
     * Mappe les erreurs backend directement sur les contrôles du formulaire.
     * Retourne un message global si l'erreur ne correspond à aucun champ.
     */
    static setErrors(form: FormGroup, err: any): string | null {
        if (!err || !err.error) {
            return "Erreur réseau ou serveur.";
        }

        const errorData = err.error;
        let globalErrorMessage: string | null = null;

        Object.keys(errorData).forEach(key => {
            // 1. Erreurs globales
            if (key === 'non_field_errors' || key === 'detail') {
                const message = Array.isArray(errorData[key]) ? errorData[key].join(' ') : errorData[key];
                globalErrorMessage = message;
            }
            // 2. Erreurs de champs
            else {
                const message = Array.isArray(errorData[key]) ? errorData[key].join(' ') : errorData[key];

                // On garde une trace de tous les messages pour le Toast
                // Format: "Nom: Ce champ est requis"
                const fieldLabel = key.charAt(0).toUpperCase() + key.slice(1);
                const readableMessage = `${fieldLabel} : ${message}`;

                globalErrorMessage = globalErrorMessage ? `${globalErrorMessage} | ${readableMessage}` : readableMessage;

                const control = form.get(key);
                if (control) {
                    // On set l'erreur sur le control Angular
                    control.setErrors({ serverError: message });
                    control.markAsTouched(); // Pour afficher l'erreur visuellement
                }
            }
        });

        return globalErrorMessage;
    }
}
