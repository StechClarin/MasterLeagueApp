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
                    this.formErrors = FormUtils.setErrors(this.form, err, this.fieldLabels);
                    
                    if (this.formErrors.length > 0) {
                        this.toastService.error('Veuillez corriger les erreurs indiquées.');
                    } else {
                        this.toastService.error('Une erreur est survenue lors de l\'enregistrement.');
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
}
