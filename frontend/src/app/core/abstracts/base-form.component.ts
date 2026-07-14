import { Component, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { FormUtils } from '../utils/form.utils';
import { ToastService } from '@core/services/toast.service';
import { LoggingService } from '../services/logging.service';

@Component({ template: '' })
export abstract class BaseFormComponent implements OnInit {
    @Output() cancel = new EventEmitter<void>();
    @Output() success = new EventEmitter<void>();

    abstract form: FormGroup;
    isSubmitting = false;
    errorMessage: string | null = null;
    formErrors: Array<{ field: string, message: string }> = [];

    protected toastService = inject(ToastService);
    protected logger = inject(LoggingService);
    protected componentName = this.constructor.name;

    protected fieldLabels: { [key: string]: string } = {};

    abstract save(): Observable<any>;

    ngOnInit() {
        this.logger.logLifecycle(this.componentName, 'Initialized (Form)');
    }

    submit() {
        this.logger.logAction(this.componentName, 'Submit Attempt');
        this.errorMessage = null;
        this.formErrors = [];

        if (this.form.valid) {
            this.isSubmitting = true;

            this.logger.logAction(this.componentName, 'Form Valid - Saving...');
            this.save().subscribe({
                next: (res) => {
                    this.isSubmitting = false;
                    this.logger.logAction(this.componentName, 'Save Success', res);
                    this.form.reset(); 
                    this.success.emit();
                },
                error: (err) => {
                    console.error('Erreur soumission formulaire:', err);
                    this.logger.logAction(this.componentName, 'Save Error', err);
                    this.isSubmitting = false;
                    
                    // Injection et récupération des erreurs structurées
                    const allErrors = FormUtils.setErrors(this.form, err, this.fieldLabels);
                    
                    // Séparer les erreurs de validation globales (ex: "Global", "global")
                    const globalErrors = allErrors.filter(e => e.field.toLowerCase() === 'global');
                    const fieldErrors = allErrors.filter(e => e.field.toLowerCase() !== 'global');
                    
                    // Seules les erreurs de champs spécifiques restent dans le formulaire
                    this.formErrors = fieldErrors;
                    
                    if (globalErrors.length > 0) {
                        // Les erreurs globales s'affichent sous forme de Toast
                        const richMessage = globalErrors.map(e => e.message).join('\n');
                        this.toastService.error(richMessage);
                    } else if (fieldErrors.length > 0) {
                        // S'il n'y a que des erreurs de champs, on alerte pour corriger le formulaire
                        this.toastService.warning('Veuillez corriger les erreurs de saisie.');
                    } else {
                        this.toastService.error(FormUtils.getError(err));
                    }
                }
            });
        } else {
            this.logger.logAction(this.componentName, 'Form Invalid', this.form.errors);
            this.form.markAllAsTouched();

            // Génération des erreurs pour la validation locale
            const invalidFields: string[] = [];

            const findInvalidControls = (control: any, prefix = '') => {
                if (control.controls) {
                    if (Array.isArray(control.controls)) {
                        control.controls.forEach((child: any, index: number) => {
                            if (child.invalid) {
                                findInvalidControls(child, prefix ? `${prefix}[${index}]` : `[${index}]`);
                            }
                        });
                    } else {
                        Object.keys(control.controls).forEach(key => {
                            const child = control.get(key);
                            if (child && child.invalid) {
                                if (child.controls) {
                                    findInvalidControls(child, prefix ? `${prefix}.${key}` : key);
                                } else {
                                    const fieldKey = prefix ? `${prefix}.${key}` : key;
                                    const label = this.fieldLabels[fieldKey] || this.fieldLabels[key] || key;
                                    invalidFields.push(label);
                                    
                                    this.formErrors.push({
                                        field: label,
                                        message: 'Ce champ est obligatoire ou invalide.'
                                    });
                                }
                            }
                        });
                    }
                }
            };

            findInvalidControls(this.form);

            if (this.formErrors.length > 0) {
                this.toastService.warning('Le formulaire est incomplet.');
            }
        }
    }

    onCancel() {
        this.logger.logAction(this.componentName, 'Click Cancel');
        this.form.reset(); // [GLOBAL RESET] On vide le formulaire lors de l'annulation
        this.cancel.emit();
    }

    /**
     * Résout une URL de média en tenant compte de l'origine dynamique du navigateur.
     * Indispensable pour que les images s'affichent correctement sur le VPS sans dépendre de 127.0.0.1.
     */
    resolveMediaUrl(path: string | null | undefined): string {
        if (!path) return '';
        
        if (path.startsWith('data:')) return path;

        // Extraire la partie après /media/ s'il s'agit d'une URL absolue de dev ou de prod
        const mediaIndex = path.indexOf('/media/');
        if (mediaIndex !== -1) {
            path = path.substring(mediaIndex); // Devient /media/...
        } else if (path.startsWith('http')) {
            return path;
        }
        
        // Nettoyage du path
        let cleanPath = path.startsWith('/') ? path.substring(1) : path;
        
        // On récupère l'origine dynamique (protocole + hôte + port)
        const host = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
        
        // S'assurer qu'on a /media/ au début si ce n'est pas déjà le cas
        if (!cleanPath.startsWith('media/')) {
            cleanPath = 'media/' + cleanPath;
        }
        
        return `${host}/${cleanPath}`;
    }
}
