import { FormGroup, FormArray } from '@angular/forms';

export class FormUtils {
    /**
     * Nettoie les messages d'erreur techniques du backend (ORM, Python, DRF) pour afficher du français clair à l'utilisateur.
     */
    static sanitizeMessage(msg: any): string {
        if (!msg || typeof msg !== 'string') return "Une erreur est survenue lors du traitement.";

        const lower = msg.toLowerCase();
        if (lower.includes('cannot assign') || lower.includes('must be a') || lower.includes('establishment')) {
            return "L'établissement sélectionné ou de rattachement est invalide.";
        }
        if (lower.includes('is not a valid uuid')) {
            return "Identifiant sélectionné non valide.";
        }
        if (lower.includes('integrityerror') || lower.includes('duplicate key') || lower.includes('already exists')) {
            return "Un enregistrement avec ces critères existe déjà.";
        }
        if (lower.includes('not null constraint')) {
            return "Des informations obligatoires sont manquantes.";
        }
        if (lower.includes('doesnotexist') || lower.includes('matching query does not exist')) {
            return "L'élément sélectionné est introuvable.";
        }
        if (lower.includes('syntaxerror') || lower.includes('typeerror') || lower.includes('attributeerror')) {
            return "Erreur lors du traitement de la requête par le serveur.";
        }
        return msg;
    }

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
            const raw = Array.isArray(errorData.non_field_errors)
                ? errorData.non_field_errors.join(' ')
                : errorData.non_field_errors;
            return this.sanitizeMessage(raw);
        }

        // 2. Erreur générique DRF (ex: Permission denied ou exception)
        if (errorData.detail) {
            return this.sanitizeMessage(errorData.detail);
        }

        // 3. Erreurs de champs (ex: {"email": ["Invalide"]})
        const firstErrorKey = Object.keys(errorData)[0];
        if (firstErrorKey) {
            const fieldError = errorData[firstErrorKey];
            const message = Array.isArray(fieldError) ? fieldError.join(' ') : fieldError;
            const fieldName = firstErrorKey.charAt(0).toUpperCase() + firstErrorKey.slice(1);
            return `${fieldName} : ${this.sanitizeMessage(message)}`;
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
                    const message = FormUtils.sanitizeMessage(Array.isArray(error) ? error.join(' ') : error);
                    errorsList.push({ field: 'Global', message });
                }
                // 2. Erreurs imbriquées
                else if (typeof error === 'object' && !Array.isArray(error)) {
                    const subControl = container.get(key);
                    if (subControl instanceof FormGroup) {
                        processErrors(subControl, error, `${prefix}${key}.`);
                    } else {
                        errorsList.push({ field: key, message: FormUtils.sanitizeMessage(JSON.stringify(error)) });
                    }
                }
                // 2.5 Erreurs imbriquées dans un FormArray
                else if (Array.isArray(error) && typeof error[0] === 'object') {
                    const subControl = container.get(key);
                    if (subControl instanceof FormArray) {
                        error.forEach((itemError: any, index: number) => {
                            if (typeof itemError === 'object') {
                                const formGroupInArray = subControl.at(index);
                                if (formGroupInArray instanceof FormGroup) {
                                    processErrors(formGroupInArray, itemError, `${prefix}${key}[${index}].`);
                                }
                            }
                        });
                    } else {
                        errorsList.push({ field: key, message: FormUtils.sanitizeMessage(JSON.stringify(error)) });
                    }
                }
                // 3. Erreurs de champs standards
                else {
                    const rawMessage = Array.isArray(error) ? error.join(' ') : error;
                    const message = FormUtils.sanitizeMessage(rawMessage);

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
                        // Try with _id suffix: classe -> classe_id, matiere -> matiere_id
                        targetKey = `${key}_id`;
                        control = container.get(targetKey);
                    }

                    if (!control) {
                        // Try with Id suffix: level -> levelId, academicYear -> academicYearId
                        targetKey = `${key}Id`;
                        control = container.get(targetKey);
                    }

                    // On utilise le label fourni ou on transforme la clé pour la lisibilité
                    let rawLabel = fieldLabels[targetKey] || fieldLabels[key] || targetKey.charAt(0).toUpperCase() + targetKey.slice(1);
                    if (prefix) {
                        const match = prefix.match(/\[(\d+)\]/);
                        if (match) {
                            const indexOne = parseInt(match[1], 10) + 1;
                            rawLabel = `Ligne #${indexOne} - ${rawLabel}`;
                        }
                    }

                    const fieldLabel = rawLabel;
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
