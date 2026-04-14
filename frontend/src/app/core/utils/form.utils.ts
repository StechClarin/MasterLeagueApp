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
     * Retourne une liste d'erreurs structurées pour un affichage riche.
     */
    static setErrors(form: FormGroup, err: any, fieldLabels: { [key: string]: string } = {}): Array<{ field: string, message: string }> {
        const errorsList: Array<{ field: string, message: string }> = [];
        if (!err || !err.error) {
            errorsList.push({ field: 'Système', message: "Erreur réseau ou serveur." });
            return errorsList;
        }

        const errorData = err.error;

        const processErrors = (container: FormGroup, errors: any, prefix = '') => {
            Object.keys(errors).forEach(key => {
                const error = errors[key];

                // 1. Erreurs globales (non-field)
                if (key === 'non_field_errors' || key === 'detail') {
                    const message = Array.isArray(error) ? error.join(' ') : error;
                    errorsList.push({ field: 'Global', message });
                }
                // 2. Erreurs imbriquées
                else if (typeof error === 'object' && !Array.isArray(error)) {
                    const subControl = container.get(key);
                    if (subControl instanceof FormGroup) {
                        processErrors(subControl, error, `${prefix}${key}.`);
                    } else {
                        // On tente de mapper même si ce n'est pas un FormGroup (ex: objet JSON brut)
                        errorsList.push({ field: key, message: JSON.stringify(error) });
                    }
                }
                // 3. Erreurs de champs standards
                else {
                    const message = Array.isArray(error) ? error.join(' ') : error;
                    
                    // SMART MAPPING : On tente de trouver le contrôle correspondant
                    // ex: backend 'academic_year' -> frontend 'academicYear' ou 'academicYearId'
                    let targetKey = key;
                    let control = container.get(targetKey);

                    if (!control) {
                        // Try camelCase: academic_year -> academicYear
                        targetKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
                        control = container.get(targetKey);
                    }

                    if (!control) {
                        // Try with Id suffix: level -> levelId, academicYear -> academicYearId
                        targetKey += 'Id';
                        control = container.get(targetKey);
                    }

                    // On utilise le label fourni ou on transforme la clé pour la lisibilité
                    const fieldLabel = fieldLabels[targetKey] || fieldLabels[key] || targetKey.charAt(0).toUpperCase() + targetKey.slice(1);
                    errorsList.push({ field: fieldLabel, message });

                    if (control) {
                        control.setErrors({ serverError: message });
                        control.markAsTouched();
                    }
                }
            });
        };

        processErrors(form, errorData);
        return errorsList;
    }

    /**
     * Convertit une chaîne de caractères camelCase en snake_case.
     */
    static toSnakeCase(str: string): string {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    }

    /**
     * Parcourt récursivement un objet pour convertir toutes ses clés en snake_case.
     */
    static convertPayloadToSnakeCase(obj: any): any {
        if (!obj) return obj; // Handle null/undefined

        if (Array.isArray(obj)) {
            return obj.map(v => this.convertPayloadToSnakeCase(v));
        } else if (typeof obj === 'object' && obj.constructor === Object) {
            return Object.keys(obj).reduce(
                (result, key) => ({
                    ...result,
                    [this.toSnakeCase(key)]: this.convertPayloadToSnakeCase(obj[key]),
                }),
                {},
            );
        }
        return obj;
    }
}
