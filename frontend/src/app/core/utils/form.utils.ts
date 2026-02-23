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
     * Supporte les erreurs imbriquées (ex: { "enrollment_input": { "classroom_id": ["..."] } })
     */
    static setErrors(form: FormGroup, err: any): string | null {
        if (!err || !err.error) {
            return "Erreur réseau ou serveur.";
        }

        const errorData = err.error;
        let globalErrorMessage: string | null = null;

        const processErrors = (container: FormGroup, errors: any, prefix = '') => {
            Object.keys(errors).forEach(key => {
                const error = errors[key];

                // 1. Erreurs globales au niveau actuel
                if (key === 'non_field_errors' || key === 'detail') {
                    const message = Array.isArray(error) ? error.join(' ') : error;
                    globalErrorMessage = globalErrorMessage ? `${globalErrorMessage} | ${message}` : message;
                }
                // 2. Erreurs imbriquées (Recursion)
                else if (typeof error === 'object' && !Array.isArray(error)) {
                    const subControl = container.get(key);
                    if (subControl instanceof FormGroup) {
                        processErrors(subControl, error, `${prefix}${key}.`);
                    } else {
                        // Si ce n'est pas un FormGroup, on traite comme une erreur plate mais avec préfixe
                        const message = JSON.stringify(error);
                        globalErrorMessage = globalErrorMessage ? `${globalErrorMessage} | ${prefix}${key}: ${message}` : `${prefix}${key}: ${message}`;
                    }
                }
                // 3. Erreurs de champs standards
                else {
                    const message = Array.isArray(error) ? error.join(' ') : error;
                    const fieldLabel = key.charAt(0).toUpperCase() + key.slice(1);
                    const readableMessage = `${prefix}${fieldLabel} : ${message}`;

                    globalErrorMessage = globalErrorMessage ? `${globalErrorMessage} | ${readableMessage}` : readableMessage;

                    const control = container.get(key);
                    if (control) {
                        control.setErrors({ serverError: message });
                        control.markAsTouched();
                    }
                }
            });
        };

        processErrors(form, errorData);
        return globalErrorMessage;
    }
}
